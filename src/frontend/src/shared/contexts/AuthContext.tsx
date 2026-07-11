import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { LoginUser, LoginMode } from "../../app/types/auth";

// ─── Storage Keys ──────────────────────────────────────────────────────────
const STORAGE_KEYS = {
  TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "currentUser",
  MODE: "loginMode",
} as const;

// ─── Context Shape ─────────────────────────────────────────────────────────
interface AuthContextValue {
  user: LoginUser | null;
  token: string | null;
  mode: LoginMode | null;
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string, user: LoginUser, mode: LoginMode) => void;
  logout: () => void;
  updateUser: (updates: Partial<LoginUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helper: read initial state from localStorage ──────────────────────────
function loadInitialState(): {
  user: LoginUser | null;
  token: string | null;
  mode: LoginMode | null;
} {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const rawUser = localStorage.getItem(STORAGE_KEYS.USER);
    const mode = localStorage.getItem(STORAGE_KEYS.MODE) as LoginMode | null;

    if (token && rawUser && mode) {
      return { token, user: JSON.parse(rawUser) as LoginUser, mode };
    }
  } catch {
    // Corrupted data — clear and start fresh
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.MODE);
  }

  return { user: null, token: null, mode: null };
}

// ─── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadInitialState();

  const [user, setUser] = useState<LoginUser | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);
  const [mode, setMode] = useState<LoginMode | null>(initial.mode);

  const login = useCallback(
    (newToken: string, newRefreshToken: string, newUser: LoginUser, newMode: LoginMode) => {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.MODE, newMode);
      setToken(newToken);
      setUser(newUser);
      setMode(newMode);
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.MODE);
    setToken(null);
    setUser(null);
    setMode(null);
  }, []);

  const updateUser = useCallback((updates: Partial<LoginUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      mode,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      updateUser,
    }),
    [user, token, mode, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

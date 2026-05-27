import { useState } from "react";
import LoginScreen from "./features/auth/LoginScreen";
import type { LoginMode } from "./features/auth/LoginScreen";
import {StudentDashboard} from "./layouts/StudentDashboard";
import {StaffPanel} from "./features/staff/StaffPanel";
import type { LoginUser } from "./features/auth/authApi";

type AppSession = {
  user: LoginUser;
  mode: LoginMode;
};

export default function App() {
  const savedUser = localStorage.getItem("currentUser");
  const savedMode = localStorage.getItem("loginMode") as LoginMode | null;

  let initialSession: AppSession | null = null;

  try {
    if (savedUser && savedMode) {
      initialSession = {
        user: JSON.parse(savedUser),
        mode: savedMode,
      };
    }
  } catch {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loginMode");
  }

  const [session, setSession] = useState<AppSession | null>(initialSession);

  function handleLogin(user: LoginUser, mode: LoginMode) {
    setSession({ user, mode });
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loginMode");
    setSession(null);
  }

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }
  const role = session.user.role?.toUpperCase();

  if (session.mode === "staff") {
    if (role === "STAFF" || role === "ADMIN" || role === "MENTOR") {
      return <StaffPanel onLogout={handleLogout} />;
    }

    handleLogout();
    return null;
  }

  if (role !== "STUDENT") {
    handleLogout();
    return null;
  }

  return <StudentDashboard onLogout={handleLogout} />;
}
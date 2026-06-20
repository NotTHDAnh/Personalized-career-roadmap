// ─── Auth Types ────────────────────────────────────────────────────────────
// Centralized from: authApi.ts, App.tsx, LoginScreen.tsx

export type LoginMode = "student" | "staff";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginUser = {
  userId: string;
  email: string;
  fullName: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: LoginUser;
};

export type AppSession = {
  user: LoginUser;
  mode: LoginMode;
};

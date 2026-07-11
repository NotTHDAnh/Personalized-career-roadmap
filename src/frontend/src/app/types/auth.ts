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
  avatarUrl?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: LoginUser;
  mentorSessionData?: any;
};

export type AppSession = {
  user: LoginUser;
  mode: LoginMode;
};

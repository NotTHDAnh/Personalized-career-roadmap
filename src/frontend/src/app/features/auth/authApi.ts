import { apiClient } from "../../../shared/api/apiClient";

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

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data),
};
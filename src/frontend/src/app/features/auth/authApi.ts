import { apiClient } from "../../../shared/api/apiClient";
import type { LoginRequest, LoginResponse } from "../../types/auth";

export type { LoginUser, LoginRequest, LoginResponse } from "../../types/auth";

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/auth/login", data),
};
import { apiClient } from "../../../shared/api/apiClient";

export const loginApi = async (payload: unknown) => {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
};

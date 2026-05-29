import { apiClient } from "../../../shared/api/apiClient";

export const fetchProfile = async () => {
  const response = await apiClient.get("/profile");
  return response.data;
};

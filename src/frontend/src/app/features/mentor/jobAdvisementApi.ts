import { apiClient } from "../../../shared/api/apiClient";

export const fetchMentorSuggestions = async () => {
  const response = await apiClient.get("/mentor");
  return response.data;
};

import { apiClient } from "../../../shared/api/apiClient";

export const fetchRoadmaps = async () => {
  const response = await apiClient.get("/roadmaps");
  return response.data;
};

import { apiClient } from "../../../shared/api/apiClient";

export const roadmapApi = {
  getCareerRoles: () => apiClient.get("/career-roles"),
  generate: (payload: unknown) => apiClient.post("/roadmap/generate", payload),
  getByUser: (userId: string) => apiClient.get(`/roadmap/user/${userId}`),
  completeNode: (nodeId: string) => apiClient.patch(`/roadmap/nodes/${nodeId}/complete`),
};

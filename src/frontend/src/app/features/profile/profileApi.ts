import { apiClient } from "../../../shared/api/apiClient";

export const profileApi = {
  getMe: () => apiClient.get("/profile/me"),
  updateMe: (payload: unknown) => apiClient.put("/profile/me", payload),
  getAcademicRecords: () => apiClient.get("/profile/me/academic-records"),
  addAcademicRecord: (payload: unknown) => apiClient.post("/profile/me/academic-records", payload),
  getSkills: () => apiClient.get("/profile/me/skills"),
};

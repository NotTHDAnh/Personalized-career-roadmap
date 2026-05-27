import { apiClient } from "../../../shared/api/apiClient";

export const jobAdvisementApi = {
  analyze: (payload: unknown) => apiClient.post("/job-advisement/analyze", payload),
};

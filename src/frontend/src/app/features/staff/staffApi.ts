import { apiClient } from "../../../shared/api/apiClient";

export const uploadTranscript = async (formData: FormData) => {
  const response = await apiClient.post("/staff/upload", formData);
  return response.data;
};

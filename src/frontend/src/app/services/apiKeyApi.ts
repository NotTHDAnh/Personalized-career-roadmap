import { apiClient } from "../../shared/api/apiClient";

export type ApiKeyStatus = {
    hasKey: boolean;
    maskedKey?: string | null;
};

export function getApiKeyStatus(userId: string): Promise<ApiKeyStatus> {
    return apiClient.get<ApiKeyStatus>(`/users/${encodeURIComponent(userId)}/gemini-key`);
}

export function saveApiKey(
    userId: string,
    geminiApiKey: string
): Promise<void> {
    return apiClient.post<void>(`/users/${encodeURIComponent(userId)}/gemini-key`, {
        geminiApiKey
    });
}

export function deleteApiKey(userId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${encodeURIComponent(userId)}/gemini-key`);
}
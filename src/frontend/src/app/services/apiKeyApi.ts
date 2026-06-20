/// <reference types="vite/client" />
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type ApiKeyStatus = {
    hasKey: boolean;
    maskedKey?: string | null;
};

export type ApiError = Error & {
    status?: number;
};

async function parseApiError(response: Response): Promise<ApiError> {
    const text = await response.text();
    let message = text || "Request failed";

    try {
        const data = JSON.parse(text);
        message = data.message || data.error || message;
    } catch {
        // keep plain text message
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    return error;
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw await parseApiError(response);
    }

    const text = await response.text();
    if (!text) return {} as T;

    return JSON.parse(text) as T;
}

function getGeminiKeyUrl(userId: string) {
    return `${API_BASE_URL}/users/${encodeURIComponent(userId)}/gemini-key`;
}

export async function getApiKeyStatus(userId: string): Promise<ApiKeyStatus> {
    const response = await fetch(getGeminiKeyUrl(userId));
    return parseResponse<ApiKeyStatus>(response);
}

export async function saveApiKey(
    userId: string,
    geminiApiKey: string
): Promise<void> {
    const response = await fetch(getGeminiKeyUrl(userId), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ geminiApiKey }),
    });

    await parseResponse<void>(response);
}

export async function deleteApiKey(userId: string): Promise<void> {
    const response = await fetch(getGeminiKeyUrl(userId), {
        method: "DELETE",
    });

    await parseResponse<void>(response);
}
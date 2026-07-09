import { apiClient } from "../../shared/api/apiClient";

export type GithubProfileStatus = {
    githubUsername?: string;
    avatarUrl?: string | null;
    portfolioUrl?: string | null;
    isConnected: boolean;
};

export function getGithubProfile(): Promise<GithubProfileStatus> {
    return apiClient.get<GithubProfileStatus>("/github/profile");
}

export function connectGithub(code: string): Promise<{ message: string; username: string }> {
    return apiClient.post<{ message: string; username: string }>("/github/callback", { code });
}

export function syncGithubRepos(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/github/sync");
}

export function disconnectGithub(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>("/github/disconnect");
}

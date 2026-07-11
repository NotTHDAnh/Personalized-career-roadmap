const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:5007/api";

// ─── Logout callback (set by AuthProvider) ─────────────────────────────────
let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorized = callback;
}

// ─── Core request function ─────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("accessToken");

  const isFormData = options.body instanceof FormData;
  const defaultHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  if (!isFormData) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
  } catch (err) {
    throw new Error(
      err instanceof TypeError
        ? "Network error — unable to reach the server."
        : "An unexpected error occurred.",
    );
  }

  // 401 Unauthorized → auto logout or refresh (except for auth endpoints)
  const isAuthEndpoint =
    endpoint.toLowerCase().includes("/auth/login") ||
    endpoint.toLowerCase().includes("/auth/google-login") ||
    endpoint.toLowerCase().includes("/auth/refresh");

  if (response.status === 401 && !isAuthEndpoint) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          if (data.user) {
            localStorage.setItem("currentUser", JSON.stringify(data.user));
          }

          // Retry the request with the new access token
          const retryOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${data.accessToken}`,
            },
          };
          return request<T>(endpoint, retryOptions);
        }
      } catch (refreshErr) {
        console.error("Silent refresh failed:", refreshErr);
      }
    }

    // If refresh token is missing or refresh failed, perform logout
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("loginMode");
    onUnauthorized?.();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorText = await response.text();
    
    // Auto-translate Vietnamese API errors to English
    if (/[\u00C0-\u1EF9]/.test(errorText)) {
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.message) {
          const lower = parsed.message.toLowerCase();
          if (lower.includes("mật khẩu")) parsed.message = "Invalid password.";
          else if (lower.includes("không tìm thấy")) parsed.message = "Resource not found.";
          else if (lower.includes("đã được liên kết")) parsed.message = "Account is already linked.";
          else if (lower.includes("không hợp lệ")) parsed.message = "Invalid data or code provided.";
          else if (lower.includes("tồn tại")) parsed.message = "Resource already exists.";
          else if (lower.includes("thất bại")) parsed.message = "Operation failed.";
          else parsed.message = "An error occurred from the server.";
          errorText = JSON.stringify(parsed);
        }
      } catch {
        const lower = errorText.toLowerCase();
        if (lower.includes("mật khẩu")) errorText = "Invalid password.";
        else if (lower.includes("không tìm thấy")) errorText = "Resource not found.";
        else if (lower.includes("đã được liên kết")) errorText = "Account is already linked.";
        else if (lower.includes("không hợp lệ")) errorText = "Invalid data or code provided.";
        else if (lower.includes("tồn tại")) errorText = "Resource already exists.";
        else if (lower.includes("thất bại")) errorText = "Operation failed.";
        else errorText = "An error occurred from the server.";
      }
    }

    throw new Error(errorText || `API request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ─── Public API ────────────────────────────────────────────────────────────
export const apiClient = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint),

  post: <T>(endpoint: string, body: unknown, customOptions?: RequestInit) =>
    request<T>(endpoint, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...customOptions,
    }),

  put: <T>(endpoint: string, body: unknown, customOptions?: RequestInit) =>
    request<T>(endpoint, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...customOptions,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, {
      method: "DELETE",
    }),
};
/**
 * Interface representing the structured API error response.
 */
export interface ParsedApiError {
  message: string;
  detail?: string;
  statusCode?: number;
}

/**
 * Parses raw error from apiClient to extract structured error details.
 */
export function parseApiError(error: any): ParsedApiError {
  if (!error) {
    return { message: "An unknown error occurred." };
  }

  const rawMessage = error.message || "";
  
  // Try to parse error.message as JSON since apiClient throws Error(errorText)
  try {
    const parsed = JSON.parse(rawMessage);
    return {
      message: parsed.message || "Request Failed",
      detail: parsed.detail,
      statusCode: parsed.statusCode,
    };
  } catch {
    // If not JSON, return the raw message
    return { message: rawMessage };
  }
}

/**
 * Checks if the parsed API error indicates a Gemini API Key issue.
 */
export function isApiKeyError(parsedError: ParsedApiError): boolean {
  const textToCheck = (parsedError.detail || parsedError.message || "").toLowerCase();
  return (
    textToCheck.includes("gemini api key") ||
    textToCheck.includes("gemini_api_key") ||
    textToCheck.includes("api key") ||
    textToCheck.includes("api_key")
  );
}

/**
 * Checks if the parsed API error specifically indicates that the key is expired, invalid, or out of quota.
 */
export function isApiKeyExpiredOrOutOfQuota(parsedError: ParsedApiError): boolean {
  if (!isApiKeyError(parsedError)) return false;

  const textToCheck = (parsedError.detail || parsedError.message || "").toLowerCase();
  
  // Checking both English and Vietnamese error indicators:
  // English: expired, quota, limit, invalid, exhausted, 400, 403
  // Vietnamese: hết hạn, không hợp lệ, hết hạn mức, không hoạt động, vượt quá
  return (
    textToCheck.includes("expired") ||
    textToCheck.includes("quota") ||
    textToCheck.includes("limit") ||
    textToCheck.includes("invalid") ||
    textToCheck.includes("exhausted") ||
    textToCheck.includes("hết hạn") ||
    textToCheck.includes("không hợp lệ") ||
    textToCheck.includes("hết hạn mức") ||
    textToCheck.includes("không hoạt động") ||
    textToCheck.includes("vượt quá")
  );
}

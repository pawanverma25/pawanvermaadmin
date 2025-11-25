import { API_BASE_URL } from "./config";
import { tokenStorage, StoredTokens } from "@/lib/auth/tokenStorage";

export interface ApiRequestOptions {
  method?: string;
  body?: BodyInit | Record<string, unknown> | null;
  headers?: Record<string, string>;
  isFormData?: boolean;
  requiresAuth?: boolean;
  signal?: AbortSignal;
}

export interface ApiErrorPayload {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ refreshToken }),
  })
    .then(async (response) => {
      if (!response.ok) {
        return false;
      }
      const data = (await response.json()) as StoredTokens;
      if (data.accessToken && data.refreshToken) {
        tokenStorage.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return true;
      }
      return false;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `API request failed with status ${response.status}`;
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
  shouldRetry = true
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  const requiresAuth = options.requiresAuth ?? true;
  let body: BodyInit | undefined;

  const providedBody = options.body;
  if (providedBody instanceof FormData) {
    body = providedBody;
  } else if (providedBody !== undefined && providedBody !== null) {
    if (!headers.has("Content-Type") && !options.isFormData) {
      Object.entries(JSON_HEADERS).forEach(([key, value]) =>
        headers.set(key, value)
      );
    }
    body =
      options.isFormData && typeof providedBody !== "string"
        ? (providedBody as BodyInit)
        : JSON.stringify(providedBody);
  }

  if (requiresAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body,
    signal: options.signal,
    cache: "no-store",
  });

  if (response.status === 401 && requiresAuth && shouldRetry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    tokenStorage.clearTokens();
  }

  return parseResponse<T>(response);
}


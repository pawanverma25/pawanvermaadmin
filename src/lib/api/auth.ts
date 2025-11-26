import { apiFetch } from "./http";
import { tokenStorage } from "@/lib/auth/tokenStorage";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  signup(payload: SignupRequest) {
    return apiFetch<void>("/api/auth/signup", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      requiresAuth: false,
    });
  },
  login(payload: LoginRequest) {
    return apiFetch<AuthTokens>("/api/auth/login", {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
      requiresAuth: false,
    });
  },
  async logout() {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return;
    }

    await apiFetch<void>("/api/auth/logout", {
      method: "POST",
      body: { refreshToken },
      requiresAuth: false,
    }).catch(() => {
      // ignore logout failures
    });
  },
};


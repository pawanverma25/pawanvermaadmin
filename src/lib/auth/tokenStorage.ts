const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isBrowser = () => typeof window !== "undefined";

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(tokens: StoredTokens) {
    if (!isBrowser()) return;
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  },
  clearTokens() {
    if (!isBrowser()) return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};


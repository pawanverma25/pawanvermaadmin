"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { tokenStorage } from "@/lib/auth/tokenStorage";

interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isBrowser = () => typeof window !== "undefined";

interface JwtPayload {
  sub?: string | number;
  email?: string;
  name?: string;
  roles?: string[];
  authorities?: string[];
  userId?: string | number;
  [key: string]: unknown;
}

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

const deriveUser = (token: string, fallback: Partial<User>): User => {
  const payload = decodeJwt(token) || {};
  const id =
    payload.userId?.toString() ||
    payload.sub?.toString() ||
    fallback.id ||
    fallback.email ||
    "";
  const email = payload.email || fallback.email || "";
  const name = payload.name || fallback.name || email.split("@")[0] || "";
  const roles: string[] | undefined = payload.roles || payload.authorities;

  return {
    id,
    email,
    name,
    roles,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      if (!isBrowser()) {
        setIsLoading(false);
        return;
      }

      const storedUser = localStorage.getItem("user");
      const accessToken = tokenStorage.getAccessToken();

      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
        } catch {
          localStorage.removeItem("user");
        }
      }

      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const tokens = await authApi.login({ email, password });
      tokenStorage.setTokens(tokens);
      const derivedUser = deriveUser(tokens.accessToken, {
        email,
        name: email.split("@")[0],
      });

      if (!derivedUser.id) {
        throw new Error("User information missing in token");
      }

      if (isBrowser()) {
        localStorage.setItem("user", JSON.stringify(derivedUser));
      }

      setUser(derivedUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authApi.signup({ name, email, password });
      return login(email, password);
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    if (isBrowser()) {
      localStorage.removeItem("user");
      localStorage.removeItem("loginTime");
    }
    tokenStorage.clearTokens();
    setUser(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


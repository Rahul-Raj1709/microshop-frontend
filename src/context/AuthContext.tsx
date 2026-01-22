import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { getClientId } from "../lib/clientId";

// Centralized env-based config (avoid hardcoding dev URLs in code)
import { API_URL } from "@/config/env";

export type UserRole = "SuperAdmin" | "Admin" | "Customer";

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  phoneNumber?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  getToken: () => string | null;
  API_URL: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Client-side JWT parsing is ONLY for UI/UX convenience.
   * Real access control must be enforced by the backend.
   */
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const isTokenExpired = (claims: any) => {
    const expSeconds = typeof claims?.exp === "number" ? claims.exp : null;
    if (!expSeconds) return false; // if backend doesn't set exp, we can't enforce expiry client-side
    return Date.now() >= expSeconds * 1000;
  };

  useEffect(() => {
    let expiryTimer: number | undefined;

    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      const claims = parseJwt(storedToken);
      if (claims && !isTokenExpired(claims)) {
        setUser({
          id: claims.userid || claims.sub,
          name: claims.name || claims.username,
          email: claims.email,
          username: claims.username,
          role: claims.role as UserRole,
          token: storedToken,
        });

        // Auto-logout when token expires (UX improvement; backend must still enforce auth)
        if (typeof claims.exp === "number") {
          const msUntilExpiry = claims.exp * 1000 - Date.now();
          if (msUntilExpiry > 0) {
            expiryTimer = window.setTimeout(() => {
              setUser(null);
              localStorage.removeItem("token");
            }, msUntilExpiry);
          }
        }
      } else {
        // Expired or invalid token
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);

    return () => {
      if (expiryTimer) window.clearTimeout(expiryTimer);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 2. USE LOWERCASE UPSTREAM PATH (/auth/...)
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ClientId: getClientId(),
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("token", data.token);

      const claims = parseJwt(data.token);
      if (!claims || isTokenExpired(claims)) {
        localStorage.removeItem("token");
        setUser(null);
        return false;
      }

      setUser({
        id: claims.userid,
        name: data.name || claims.name,
        email: claims.email,
        username: claims.username,
        role: data.role || claims.role,
        token: data.token,
      });

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  const getToken = () => localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isLoading, getToken, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

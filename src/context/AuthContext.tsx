import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "SuperAdmin" | "Admin" | "Customer";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const MOCK_USERS: User[] = [
  { id: "1", email: "superadmin@microshop.com", username: "SuperAdmin", role: "SuperAdmin" },
  { id: "2", email: "admin@microshop.com", username: "Admin", role: "Admin" },
  { id: "3", email: "customer@microshop.com", username: "Customer", role: "Customer" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call your API
    const foundUser = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser && password.length >= 1) {
      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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

export { AuthContext };

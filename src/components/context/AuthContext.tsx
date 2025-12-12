"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "../types";
// import { <User></User> } from "@/types/index";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUser: User = {
  id: "1",
  email: "admin@store.com",
  name: "Admin User",
  role: "ADMIN",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    localStorage.getItem("storeToken");
    if (email === "admin@store.com" && password === "admin123") {
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

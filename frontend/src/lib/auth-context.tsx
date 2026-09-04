"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, api } from "./api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("pulse_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await api.getMe();
        setUser(u);
      } catch (err) {
        console.error("Failed to authenticate session:", err);
        localStorage.removeItem("pulse_token");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    const u = await api.getMe();
    setUser(u);
  };

  const register = async (email: string, password: string, full_name: string) => {
    await api.register(email, password, full_name);
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem("pulse_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

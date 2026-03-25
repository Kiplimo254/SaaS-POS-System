import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { User } from "@/types/auth"; // We'll create this type

interface AuthContextType {
  user: User | null;
  login: (token: string, refresh: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await api.get("user/me/");
      setUser(response.data);
    } catch (error) {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, refresh: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refresh", refresh);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

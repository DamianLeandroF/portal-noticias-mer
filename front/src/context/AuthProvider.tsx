import { useState, useEffect, type ReactNode } from "react";
import { API_URL } from "../config";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
      }

      setUser(data);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const registro = async (nombre: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      setUser(data);
      setToken(data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    registro,
    logout,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.rol === "admin",
    isEditor: user?.rol === "editor" || user?.rol === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

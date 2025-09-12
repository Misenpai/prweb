"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser } from "../types";

interface AuthContextType {
  user: AuthUser | null;
  logout: () => void;
  isLoading: boolean;
  setSSOUser: (ssoUser: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Checking for stored user...");

    const ssoUser = localStorage.getItem("sso_user");
    if (ssoUser) {
      try {
        const userData = JSON.parse(ssoUser);
        console.log("AuthProvider: Found SSO user:", userData);
        setUser(userData);
      } catch (error) {
        console.error("AuthProvider: Error parsing SSO user:", error);
        localStorage.removeItem("sso_user");
      }
    } else {
      console.log("AuthProvider: No SSO user found");
    }

    setIsLoading(false);
  }, []);

  const setSSOUser = (ssoUser: AuthUser) => {
    console.log("AuthProvider: Setting SSO user:", ssoUser);
    setUser(ssoUser);
    localStorage.setItem("sso_user", JSON.stringify(ssoUser));
    setCookie("sso_token", ssoUser.token);
  };

  const logout = () => {
    console.log("AuthProvider: Logging out");
    setUser(null);
    localStorage.removeItem("sso_user");
    deleteCookie("sso_token");
    window.location.href = process.env.NEXT_PUBLIC_PI_WEBSITE_URL || "/";
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, setSSOUser }}>
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

// src/context/AuthProvider.tsx
import { useEffect, useState } from "react";
import { kratos } from "../lib/kratos";
import type { Session } from "@ory/client";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { data } = await kratos.toSession();
      setSession(data);
    } catch (error) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { data } = await kratos.createBrowserLogoutFlow();
      window.location.href = data.logout_url;
    } catch (error) {
      console.error("Error logout:", error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!session, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
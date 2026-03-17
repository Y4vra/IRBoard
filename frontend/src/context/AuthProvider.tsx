import { useEffect, useState } from "react";
import { kratos } from "../lib/kratos";
import type { Session } from "@ory/client";
import { AuthContext, type UserProfile } from "./AuthContext";
import { API_BASE_URL } from "@/lib/globalVars";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const { data } = await kratos.toSession();
      setSession(data);

      if (data){
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (error) {
      setSession(null);
      setUser(null);
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
    <AuthContext.Provider value={{ isAuthenticated: !!session, session, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
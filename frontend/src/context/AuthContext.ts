import { createContext, useContext } from "react";
import type { Session } from "@ory/client";

export interface UserProfile {
  name: string;
  surname: string;
  email: string;
  isAdmin: boolean;
}
export interface AuthContextType {
  isAuthenticated: boolean;
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
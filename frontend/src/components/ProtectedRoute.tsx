import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-lg animate-pulse">Verificando sesión...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
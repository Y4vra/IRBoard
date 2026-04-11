import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user, serverError } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (serverError) {
    return <Navigate to="/error" state={{ errorType: "server" }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/error" state={{ errorType: "permission" }} replace />;
  }

  return <Outlet/>;
};
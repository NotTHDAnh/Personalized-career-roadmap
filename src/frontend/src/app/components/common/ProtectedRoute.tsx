import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/shared/contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Allowed roles (uppercase). If empty/undefined, any authenticated user is allowed. */
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toUpperCase();
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth.hook";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Not logged in, redirect to login
      router.push(
        `${redirectTo}?redirect=${encodeURIComponent(window.location.pathname)}`
      );
    } else if (
      !isLoading &&
      isAuthenticated &&
      requiredRole &&
      user?.role !== requiredRole
    ) {
      // Logged in but doesn't have required role, redirect to home
      router.push("/");
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null; // Will be redirected by the useEffect
  }

  return <>{children}</>;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requiredRole?: string; redirectTo?: string }
) {
  return function WithAuthWrapper(props: P) {
    return (
      <ProtectedRoute
        requiredRole={options?.requiredRole}
        redirectTo={options?.redirectTo}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

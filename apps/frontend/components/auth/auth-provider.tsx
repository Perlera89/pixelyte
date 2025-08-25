"use client";

import { ReactNode, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { User } from "@/types";

type AuthContextType = {
  user: Partial<User> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  checkAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, checkAuth } = useAuthStore();

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        await checkAuth();
      } finally {
        if (isLoading) return;

        const publicPaths = [
          "/",
          "/category",
          "/search",
          "/wishlist",
          "/cart",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ];

        const adminPaths = ["/admin"];
        const checkoutPath = "/checkout";

        const currentPath = window.location.pathname;
        const isPublicPath = publicPaths.some(
          (path) => currentPath === path || currentPath.startsWith(`${path}/`)
        );

        const isAdminPath = adminPaths.some((path) =>
          currentPath.startsWith(path)
        );

        // Si no está autenticado y está en una ruta protegida
        if (!isAuthenticated && !isPublicPath) {
          router.push(
            `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          );
          return;
        }

        // Si está autenticado pero intenta acceder a rutas de autenticación
        if (
          isAuthenticated &&
          ["/login", "/register", "/forgot-password", "/reset-password"].includes(
            currentPath
          )
        ) {
          router.push("/");
          return;
        }

        // Si es ruta de administración y no es admin
        if (isAdminPath && (!isAuthenticated || user?.role !== "admin")) {
          router.push("/");
          return;
        }

        // Si es checkout y no está autenticado
        if (currentPath.startsWith(checkoutPath) && !isAuthenticated) {
          router.push(
            `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
          );
        }
      }
    };

    checkAuthAndRedirect();
  }, [checkAuth, isAuthenticated, isLoading, router, user?.role]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

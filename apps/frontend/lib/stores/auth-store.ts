import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import { authApi } from "@/routes/auth.route";
import { decryptData, encryptData } from "@/lib/utils/encryption";

interface AuthState {
  user: Partial<User> | null;
  email: string;
  setEmail: (email: string) => void;
  token: string;
  refreshToken: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean;
  register: (user: Partial<User>) => Promise<void>;
  login: (user: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  validateToken: () => Promise<boolean>;
  refreshTokens: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const defaultValues = {
        user: null,
        email: "",
        setEmail: (email: string) => set({ email }),
        token: "",
        refreshToken: "",
        isLoading: false,
        isAuthenticated: false,
        isHydrated: false,
        setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      };

      const functions = {
        register: async (user: Partial<User>) => {
          try {
            set({ isLoading: true });
            const registerData = {
              email: user.email || "",
              password: user.password || "",
              names: user.names || "",
              surnames: user.surnames || "",
              phone: user.phone || "",
              dateOfBirth: user.dateOfBirth
                ? new Date(user.dateOfBirth)
                : undefined,
            };
            const response = await authApi.register(registerData);
            return response;
          } catch (error) {
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        login: async (user: Partial<User>) => {
          try {
            set({ isLoading: true });
            const loginData = {
              email: user.email || "",
              password: user.password || "",
            };
            const newLogin = await authApi.login(loginData);
            document.cookie = `role=${newLogin.user.role}; path=/; max-age=86400; secure; samesite=strict`;

            set({
              user: {
                id: newLogin.user.id,
                names: newLogin.user.names,
                surnames: newLogin.user.surnames,
                email: newLogin.user.email,
                role: newLogin.user.role,
              },
              token: newLogin.token,
              refreshToken: newLogin.refreshToken,
              isAuthenticated: true,
            });

            // Note: Sync functionality has been removed - cart and wishlist now work offline only
          } catch (error) {
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        logout: async () => {
          document.cookie = "role=; path=/; max-age=0;";
          set({
            user: null,
            token: "",
            refreshToken: "",
            isAuthenticated: false,
          });

          localStorage.removeItem("auth-storage");
        },

        validateToken: async () => {
          const { token, refreshToken, user } = get();

          if (!token) {
            set({
              isAuthenticated: false,
              user: null,
              token: "",
              refreshToken: "",
            });
            return false;
          }

          try {
            const response = await authApi.validateToken(token);

            if (response.isValid) {
              set({
                isAuthenticated: true,
                user: user || {},
              });
              return true;
            }

            if (refreshToken) {
              await get().refreshTokens();
              return true;
            }

            throw new Error(
              "Token validation failed and no refresh token available"
            );
          } catch (error: any) {
            console.error("Token validation failed:", error);
            const isUnauthorized =
              error?.response?.status === 401 ||
              error?.message?.includes("401") ||
              !refreshToken;

            if (isUnauthorized) {
              set({
                isAuthenticated: false,
                user: null,
                token: "",
                refreshToken: "",
              });
            }
            return false;
          }
        },

        refreshTokens: async () => {
          const { refreshToken: currentRefreshToken } = get();
          if (!currentRefreshToken) {
            console.error("No refresh token available");
            return;
          }

          try {
            const newTokens = await authApi.refreshToken(currentRefreshToken);
            set({
              token: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error("Refresh token failed:", error);
            await get().logout();
          }
        },

        setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      };

      const checkAuth = async () => {
        const { token, refreshToken } = get();

        // If we have no tokens, ensure we're logged out
        if (!token && !refreshToken) {
          await get().logout();
          return;
        }

        try {
          // First try to validate the current token
          const isValid = await get().validateToken();

          // If token is invalid but we have a refresh token, it will be handled in validateToken
          if (!isValid && !refreshToken) {
            await get().logout();
          }
        } catch (error: any) {
          console.error("Error checking auth:", error);
          // Only logout if we're sure the session is invalid
          const isUnauthorized =
            error?.response?.status === 401 ||
            error?.message?.includes("401") ||
            !refreshToken;

          if (isUnauthorized) {
            await get().logout();
          }
        } finally {
          // Ensure loading state is always reset
          get().setHydrated(true);
        }
      };

      return {
        ...defaultValues,
        ...functions,
        checkAuth,
        setUser: (user: User | null) => set({ user }),
        setEmail: (email: string) => set({ email }),
        setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      } as AuthState;
    },
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ({
        getItem: (name: string) => {
          const str = localStorage.getItem(name);
          return str;
        },
        setItem: (name: string, value: string) => {
          localStorage.setItem(name, value);
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      })),
      partialize: (state: AuthState) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        email: state.email,
      }),
      onRehydrateStorage: () => (state: AuthState | undefined) => {
        if (state) {
          state.isHydrated = true;
          if (state.token && !state.isAuthenticated) {
            state.checkAuth().catch(console.error);
          }
        }
      },
    }
  )
);

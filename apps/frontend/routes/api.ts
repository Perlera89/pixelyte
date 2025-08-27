import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiErrorHandler } from "@/lib/api/error-handler";

// Crear instancia de axios
export const api = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true, // Importante para enviar cookies
  timeout: 10000, // 10 second timeout
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from auth store instead of localStorage directly
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const token = authData.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Failed to parse auth storage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = ApiErrorHandler.handleError(error);

    if (ApiErrorHandler.shouldRedirectToLogin(apiError)) {
      // Clear auth data and redirect to login
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error (legacy support)
export const setupResponseInterceptor = (onUnauthenticated: () => void) => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Eliminar token inválido
        localStorage.removeItem("authToken");
        localStorage.removeItem("auth-storage");
        // Redirigir a login
        onUnauthenticated();
      }
      return Promise.reject(error);
    }
  );

  // Retornar función para limpiar el interceptor
  return () => {
    api.interceptors.response.eject(interceptor);
  };
};

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Crear instancia de axios
export const api = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true, // Importante para enviar cookies
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error
export const setupResponseInterceptor = (onUnauthenticated: () => void) => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Eliminar token inválido
        localStorage.removeItem('authToken');
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

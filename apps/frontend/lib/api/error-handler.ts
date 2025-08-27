import { AxiosError } from "axios";
import { toast } from "sonner";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  static handleError(error: unknown): ApiError {
    if (error instanceof AxiosError) {
      const status = error.response?.status || 500;
      const message =
        error.response?.data?.message || error.message || "Network error";
      const code = error.response?.data?.code;
      const details = error.response?.data?.details;

      return {
        status,
        message,
        code,
        details,
      };
    }

    return {
      status: 500,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }

  static showErrorToast(error: ApiError): void {
    const title = this.getErrorTitle(error.status);

    toast.error(title, {
      description: error.message,
      duration: 5000,
    });
  }

  static getErrorTitle(status: number): string {
    switch (status) {
      case 400:
        return "Solicitud inválida";
      case 401:
        return "No autorizado";
      case 403:
        return "Acceso denegado";
      case 404:
        return "No encontrado";
      case 409:
        return "Conflicto";
      case 422:
        return "Datos inválidos";
      case 429:
        return "Demasiadas solicitudes";
      case 500:
        return "Error del servidor";
      case 503:
        return "Servicio no disponible";
      default:
        return "Error";
    }
  }

  static shouldRetry(error: ApiError): boolean {
    // Retry on network errors or 5xx server errors
    return error.status >= 500 || error.status === 0;
  }

  static shouldRedirectToLogin(error: ApiError): boolean {
    return error.status === 401;
  }
}

export const useErrorHandler = () => {
  const handleError = (error: unknown) => {
    const apiError = ApiErrorHandler.handleError(error);
    ApiErrorHandler.showErrorToast(apiError);

    if (ApiErrorHandler.shouldRedirectToLogin(apiError)) {
      // Clear auth data and redirect to login
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }

    return apiError;
  };

  return { handleError };
};

import axios from "axios";

// Error de API que conserva el código HTTP (necesario para reaccionar a 409/404)
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

// Funcion para manejar siempre los errores que me devuelve el backend
export const handleAxiosError = (
  error: unknown,
  defaultMessage: string,
): never => {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.Message ||
      error.response?.data?.message ||
      defaultMessage;
    throw new ApiError(message, error.response?.status);
  }

  throw new ApiError(defaultMessage);
};

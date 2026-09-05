import axios from "axios";
import { toast } from "sonner";

const axiosService = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de solicitud para agregar el Bearer Token
axiosService.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("user") || "{}").token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta
axiosService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes("/login")) {
          // Limpiar localStorage/sessionStorage
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      if (error.response.status === 403) {
        toast.error("No tienes permiso para acceder a este recurso");
      }

      if (error.response.status >= 500) {
        console.error("Error del servidor:", error.response.data);
        toast.error("Error del servidor. Por favor, intente más tarde");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosService;

import axiosService from "@/config/axiosService";
import { handleAxiosError } from "@/utils/handleAxiosError";

const API_BASE_URL = "/auth";

// Funcion para que el usuario inicie sesion
const loginService = async (request: {
  userName: string;
  password: string;
}) => {
  try {
    const response = await axiosService.post(
      `https://backend-production-7230.up.railway.app/api${API_BASE_URL}/login`,
      request
    );
    return response.data.items as {
      id: number;
      fullName: string;
      userName: string;
      token: string;
    };
  } catch (error) {
    handleAxiosError(error, "Error al iniciar sesión");
  }
};

// Funcion para que el usuario pueda cerrar sesion correctamente
const logoutService = async () => {
  try {
    await axiosService.post(`${API_BASE_URL}/logout`);
    return true;
  } catch (error) {
    console.error("Error al cerrar sesión", error);
    return false;
  }
};

// Exportacion de los servicios del usuario
export const authService = {
  // Servicios de autenticacion
  loginService,
  logoutService,
};

import axiosService from "@/config/axiosService";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las operaciones de duraciones
const API_URL = "/durations";

// Obtener todas las duraciones disponibles
const getAllDurations = async () => {
  try {
    const response = await axiosService.get(API_URL);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener las duraciones");
  }
};

// Exportar el servicio de duraciones
export const durationsService = {
  getAllDurations,
};

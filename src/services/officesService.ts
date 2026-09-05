import axiosService from "@/config/axiosService";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las oficinas
const API_URL = "/offices";

// Funcion para obtener todas las oficinas
const getAllOffices = async (
  limit: number | null = null,
  offset: number | null = null,
  search: string | null = null
) => {
  try {
    const response = await axiosService.get(`${API_URL}`, {
      params: {
        limit,
        offset,
        search,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo las oficinas");
  }
};

// Exportar las funciones del servicio de oficinas
export const officesService = {
  getAllOffices,
};

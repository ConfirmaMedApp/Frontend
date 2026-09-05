import axiosService from "@/config/axiosService";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para los géneros
const API_URL = "/genders";

// Funcion para obtener todos los géneros
const getAllGenders = async () => {
  try {
    const response = await axiosService.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los géneros");
  }
};

// Exportar el servicio de géneros
export const gendersService = {
  getAllGenders,
};

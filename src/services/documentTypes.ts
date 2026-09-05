import axiosService from "@/config/axiosService";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para los tipos de documentos
const API_URL = "/documentTypes";

// Funcion para obtener todos los tipos de documento
const getAllDocumentTypes = async () => {
  try {
    const response = await axiosService.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo los tipos de documento");
  }
};

// Exportar las funciones del servicio de tipos de documento
export const documentTypesService = {
  getAllDocumentTypes,
};

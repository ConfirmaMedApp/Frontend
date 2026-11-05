import axiosService from "@/config/axiosService";
import type {
  DoctorRequest,
  DoctorUpdateRequest,
} from "@/interfaces/doctorsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las doctores
const API_URL = "/doctors";

// Funcion para obtener todos los doctores con parametros opcionales
const getAllDoctors = async (
  limit: number | null = null,
  offset: number | null = null,
  search: string | null = null,
  status: boolean | null = null
) => {
  try {
    const response = await axiosService.get(`${API_URL}`, {
      params: {
        limit,
        offset,
        search,
        status,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo los doctores");
  }
};

// Funcion para obtener un doctor por su ID
const getDoctorById = async (id: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo el doctor");
  }
};

// Funcion para obtener la hoja de vida de un doctor (datos + descripción + foto + especialidades)
const getDoctorProfile = async (id: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${id}/profile`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo la hoja de vida del doctor");
  }
};

// Funcion para crear un nuevo doctor
const createDoctor = async (doctorData: DoctorRequest) => {
  try {
    const response = await axiosService.post(`${API_URL}`, doctorData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creando el doctor");
  }
};

// Funcion para actualizar un doctor existente
const updateDoctor = async (doctorData: DoctorUpdateRequest) => {
  try {
    const response = await axiosService.put(`${API_URL}`, doctorData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando el doctor");
  }
};

// Funcion para subir o cambiar la foto de un doctor (multipart: el archivo es obligatorio)
const updateDoctorPhoto = async (id: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append("File", file);

    const response = await axiosService.put(
      `${API_URL}/${id}/photo`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        // La API sube la imagen a Cloudinary antes de responder
        timeout: 30000,
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando la foto del doctor");
  }
};

// Exportar las funciones del servicio de doctores
export const doctorsService = {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  createDoctor,
  updateDoctor,
  updateDoctorPhoto,
};

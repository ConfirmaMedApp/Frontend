import axiosService from "@/config/axiosService";
import type {
  SpecialityRequest,
  SpecialityRequestUpdate,
} from "@/interfaces/specialitiesInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las especialidades
const API_URL = "/specialities";

// Obtener todas las especialidades con parámetros opcionales
const getAllSpecialities = async (
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
        status,
        search,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo las especialidades");
  }
};

// Obtener una especialidad por su ID
const getSpecialityById = async (id: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo la especialidad");
  }
};

// Crear una nueva especialidad
const createSpeciality = async (specialityData: SpecialityRequest) => {
  try {
    const response = await axiosService.post(`${API_URL}`, specialityData);
    return response.data;
  } catch (error) {
    console.log(error);
    handleAxiosError(error, "Error creando la especialidad");
  }
};

// Actualizar una especialidad existente
const updateSpeciality = async (specialityData: SpecialityRequestUpdate) => {
  try {
    const response = await axiosService.put(`${API_URL}`, specialityData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando la especialidad");
  }
};

// Funcion para agregar doctores a una especialidad
const addDoctorsToSpeciality = async (data: {
  specialityId: number;
  doctorIds: number[];
}) => {
  try {
    const response = await axiosService.post(`/DoctorsHasSpecialities`, data);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error agregando doctores a la especialidad");
  }
};

// Funcion para obtener los doctores asociados a una especialidad
const getDoctorsBySpeciality = async (specialityId: number) => {
  try {
    const response = await axiosService.get(
      `/DoctorsHasSpecialities/specialities/${specialityId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo los doctores de la especialidad");
  }
};

// Exportar las funciones del servicio de especialidades
export const specialityService = {
  getAllSpecialities,
  getSpecialityById,
  createSpeciality,
  updateSpeciality,
  addDoctorsToSpeciality,
  getDoctorsBySpeciality,
};

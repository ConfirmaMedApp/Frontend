import axiosService from "@/config/axiosService";
import type {
  PatientRequest,
  PatientUpdateRequest,
} from "@/interfaces/patientsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las operaciones de pacientes
const API_URL = "/patients";

// Obtener todos los pacientes con opciones de paginación y búsqueda
const getAllPatients = async (
  limit: number | null = null,
  offset: number | null = null,
  search: string | null = null
) => {
  try {
    const response = await axiosService.get(API_URL, {
      params: {
        limit,
        offset,
        search,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los pacientes");
  }
};

// Obtener un paciente por su ID
const getPatientById = async (id: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener el paciente");
  }
};

// Crear un nuevo paciente
const createPatient = async (patientData: PatientRequest) => {
  try {
    const response = await axiosService.post(API_URL, patientData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al crear el paciente");
  }
};

// Actualizar un paciente existente
const updatePatient = async (patientData: PatientUpdateRequest) => {
  try {
    const response = await axiosService.put(`${API_URL}`, patientData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al actualizar el paciente");
  }
};

// Exportar las funciones del servicio de pacientes
export const patientsService = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
};

import axiosService from "@/config/axiosService";
import type { AppointmentRequest } from "@/interfaces/appointmentsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las operaciones de citas
const API_URL = "/appointments";

// Crear una o varias citas
const createAppointment = async (appointmentData: AppointmentRequest) => {
  try {
    const response = await axiosService.post(`${API_URL}`, appointmentData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al crear la o las agendas");
  }
};

// Función para obtener los días con citas en un mes y año específicos
const getDaysForYearAndMonth = async (
  year: number,
  month: number,
  doctorId: number | null = null
) => {
  try {
    const response = await axiosService.get(
      `${API_URL}/occupation/month/${year}/${month}`,
      {
        params: { doctorId },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los días con citas");
  }
};

// Funcion para obtener todas las agendas con filtros opcionales
const getAllAppointments = async (
  dateSelected: string = "",
  specialityId: number | null = null,
  doctorId: number | null = null,
  isOccuped: boolean | null = null,
  limit: number | null = null,
  offset: number | null = null
) => {
  try {
    const response = await axiosService.get(
      `${API_URL}/dates/${dateSelected}/filters`,
      {
        params: {
          specialityId,
          doctorId,
          isOccuped,
          limit,
          offset,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener las citas");
  }
};

// Función para obtener una cita por su ID
const getAppointmentById = async (appointmentId: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${appointmentId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener la cita por ID");
  }
};

// Función para asignar una cita a un paciente
const assignAppointment = async (data: {
  appointmentId: number;
  patientId: number;
}) => {
  try {
    const response = await axiosService.post(`${API_URL}/assign`, data);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al asignar la cita");
  }
};

// Exportar el servicio de citas
export const appointmentsService = {
  createAppointment,
  getDaysForYearAndMonth,
  getAllAppointments,
  assignAppointment,
  getAppointmentById,
};

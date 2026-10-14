import axiosService from "@/config/axiosService";
import type {
  ApiResponse,
  Appointment,
  AppointmentRequest,
  AppointmentStateCode,
} from "@/interfaces/appointmentsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las operaciones de citas
const API_URL = "/Appointments";

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
  doctorId: number | null = null,
) => {
  try {
    const response = await axiosService.get(
      `${API_URL}/occupation/month/${year}/${month}`,
      {
        params: { doctorId },
      },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los días con citas");
  }
};

// Funcion para obtener todas las agendas que puede ver el administrador con filtros opcionales
// Axios omite los params null, así que el filtro `state` solo viaja cuando tiene valor
const getAllAppointmentsAdmin = async (
  dateSelected: string = "",
  specialityId: number | null = null,
  doctorId: number | null = null,
  state: AppointmentStateCode | null = null,
  limit: number | null = null,
  offset: number | null = null,
) => {
  try {
    const response = await axiosService.get<ApiResponse<Appointment[]>>(
      `${API_URL}/dates/${dateSelected}/filters`,
      {
        params: {
          state,
          specialityId,
          doctorId,
          limit,
          offset,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener las citas");
  }
};

// Funcion para obtener todas las agendas que puede ver el doctor con filtros opcionales
// Este endpoint solo devuelve citas ocupadas y no acepta el filtro de estado
const getAllAppointmentsDoctor = async (
  dateSelected: string = "",
  specialityId: number | null = null,
  limit: number | null = null,
  offset: number | null = null,
) => {
  try {
    const response = await axiosService.get<ApiResponse<Appointment[]>>(
      `${API_URL}/user/dates/${dateSelected}/filters`,
      {
        params: {
          specialityId,
          limit,
          offset,
        },
      },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener las citas");
  }
};

// Función para obtener el historial de citas de un paciente específico
const getAppointmentsByPatient = async (
  patientId: number,
  specialityId: number | null = null,
  startDate: string | null = null,
  limit: number | null = null,
  offset: number | null = null,
) => {
  try {
    const response = await axiosService.get(`${API_URL}/patient/${patientId}`, {
      params: {
        specialityId,
        startDate,
        limit,
        offset,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener las citas del paciente");
  }
};

// Función para obtener una cita por su ID
const getAppointmentById = async (appointmentId: number) => {
  try {
    const response = await axiosService.get<ApiResponse<Appointment>>(
      `${API_URL}/${appointmentId}`,
    );
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

// Cancela una cita asignada. El cupo no se reutiliza y se libera la sala de video.
// `note` es opcional: si va vacía se omite del body (JSON.stringify descarta undefined)
const cancelAppointment = async (appointmentId: number, note?: string) => {
  try {
    const response = await axiosService.post<ApiResponse<Appointment>>(
      `${API_URL}/${appointmentId}/cancel`,
      { note: note?.trim() || undefined },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al cancelar la cita");
  }
};

// Marca que el paciente no asistió. Solo aplica a citas en atención.
const markAppointmentNoShow = async (appointmentId: number, note?: string) => {
  try {
    const response = await axiosService.post<ApiResponse<Appointment>>(
      `${API_URL}/${appointmentId}/no-show`,
      { note: note?.trim() || undefined },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al marcar la inasistencia");
  }
};

// Función para obtener las credenciales de acceso del doctor a la videollamada de una cita
const getDoctorVideoToken = async (appointmentId: number) => {
  try {
    const response = await axiosService.get(
      `${API_URL}/${appointmentId}/video/doctor-token`,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener el acceso a la videollamada");
  }
};

// Exportar el servicio de citas
export const appointmentsService = {
  createAppointment,
  getDaysForYearAndMonth,
  getAllAppointmentsAdmin,
  getAllAppointmentsDoctor,
  assignAppointment,
  getAppointmentById,
  getDoctorVideoToken,
  getAppointmentsByPatient,
  cancelAppointment,
  markAppointmentNoShow,
};

import axiosService from "@/config/axiosService";
import type { AppointmentNoteRequest } from "@/interfaces/appointmentsNotesInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las notas de citas
const API_URL = "/AppointmentsNotes";

// Funcion para obtener el historial de notas de una cita
const getNotesByAppointmentId = async (appointmentId: number) => {
  try {
    const response = await axiosService.get(
      `${API_URL}/appointments/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo las notas de la cita");
  }
};

// Funcion para crear una nueva nota sobre una cita
const createNote = async (data: AppointmentNoteRequest) => {
  try {
    const response = await axiosService.post(`${API_URL}`, data);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creando la nota");
  }
};

// Exportar el servicio de notas de citas
export const appointmentsNotesService = {
  getNotesByAppointmentId,
  createNote,
};

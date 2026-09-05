import type { Doctor } from "./doctorsInterface";
import type { Patient } from "./patientsInterface";
import type { Speciality } from "./specialitiesInterface";

// Interfaz para obtener los datos de la api de una cita
export interface AppointmentRequest {
  dates: string[];
  startHour: string;
  endHour: string;
  durationId: number;
  doctorId: number;
  specialityId: number;
}

// Interfaz para obtener los dias de la cita, para validar los colores del calendario
export interface DaysAppointments {
  calendarDate: string;
  statusDay: string;
  color: string;
}

// Interfaz para las agendas
export interface Appointment {
  id: number;
  dateAppointment: string;
  startHour: string;
  endHour: string;
  duration: { id: number; interval: string };
  doctor: Doctor;
  speciality: Speciality;
  patient: Patient | null;
  status: boolean;
  isOccuped: boolean;
  isApproved: boolean;
  userId: number;
}

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

// Códigos de estado que envía el backend en `state.code`
export type AppointmentStateCode =
  | "libre"
  | "asignada"
  | "en_atencion"
  | "finalizada"
  | "cancelada"
  | "no_asistio";

// Estado de la cita tal como lo devuelve el backend
export interface AppointmentState {
  id: number;
  code: AppointmentStateCode;
  name: string;
  color: string; // Hex, p. ej. "#3b82f6"
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
  patient: Patient | null; // null cuando la cita está libre
  status: boolean;
  /** @deprecated Usar `state.code`. Solo por compatibilidad. */
  isOccuped: boolean;
  /** @deprecated Usar `state.code`. Solo por compatibilidad. */
  isApproved: boolean;
  state: AppointmentState;
  userId: number;
  roomName?: string;
  roomUrl?: string;
  roomCreatedAt?: string;
  videoCallLink?: string | null; // No viene en los listados
}

// Sobre estándar de respuesta del backend (camelCase)
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  path: string;
  responseTime: string;
  items: T;
}

// Interfaz para las credenciales de acceso del doctor a la videollamada
export interface DoctorVideoCredentials {
  roomUrl: string;
  token: string;
  joinUrl: string;
  expiresAt: string;
}

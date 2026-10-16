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

// Razones con las que el backend registra un cambio de estado en el historial
export type AppointmentHistoryReason =
  | "asignacion"
  | "cancelacion"
  | "no_asistio"
  | "reagendamiento"
  | "inicio_automatico"
  | "finalizacion_automatica"
  | "migracion";

// Usuario que realizó un cambio de estado
export interface AppointmentHistoryUser {
  id: number;
  name: string;
  lastname: string;
  role: string;
  avatarUrl: string | null;
}

// Registro del historial de estados de una cita (un punto de su línea de tiempo)
export interface AppointmentHistoryEntry {
  id: number;
  fromState: AppointmentState | null; // null en el primer registro (creación del cupo)
  toState: AppointmentState;
  reason: AppointmentHistoryReason | null;
  note: string | null;
  changedBy: AppointmentHistoryUser | null; // null = lo hizo el sistema (transición automática)
  createdAt: string; // Llega sin zona horaria: se interpreta como UTC (ver parseServerDate)
}

// Body para reagendar: mueve al paciente de una cita asignada a otra libre
export interface RescheduleAppointmentRequest {
  oldAppointmentId: number;
  newAppointmentId: number;
  note?: string;
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

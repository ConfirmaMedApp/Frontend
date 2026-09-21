// Usuario que creó la nota
export interface AppointmentNoteUser {
  id: number;
  name: string;
  lastname: string;
  role: string;
  avatarUrl: string | null;
}

// Datos básicos de la cita asociada a la nota
export interface AppointmentNoteAppointment {
  id: number;
  dateAppointment: string;
  startHour: string;
}

// Nota registrada sobre una cita
export interface AppointmentNote {
  id: number;
  note: string;
  createdAt: string;
  user: AppointmentNoteUser;
  appointment: AppointmentNoteAppointment;
}

// Body para crear una nueva nota sobre una cita
export interface AppointmentNoteRequest {
  note: string;
  appointmentId: number;
  userId: number;
}

import type {
  Appointment,
  AppointmentState,
  AppointmentStateCode,
} from "@/interfaces/appointmentsInterface";

// Catálogo local. Para pintar, la fuente de verdad es `appointment.state`
// (name/color vienen del backend). Este catálogo se usa para las opciones
// de los filtros y como respaldo si `state` no viene en la respuesta.
export const APPOINTMENT_STATES: Record<
  AppointmentStateCode,
  Pick<AppointmentState, "name" | "color">
> = {
  libre: { name: "Libre", color: "#22c55e" },
  asignada: { name: "Asignada", color: "#3b82f6" },
  en_atencion: { name: "En atención", color: "#f59e0b" },
  finalizada: { name: "Finalizada", color: "#6b7280" },
  cancelada: { name: "Cancelada", color: "#ef4444" },
  no_asistio: { name: "No asistió", color: "#a855f7" },
};

// Orden para selects y leyendas
export const APPOINTMENT_STATE_ORDER: AppointmentStateCode[] = [
  "libre",
  "asignada",
  "en_atencion",
  "finalizada",
  "cancelada",
  "no_asistio",
];

// Espejo de las transiciones del backend (cualquier otra → 409)
export const APPOINTMENT_TRANSITIONS: Record<
  AppointmentStateCode,
  AppointmentStateCode[]
> = {
  libre: ["asignada"],
  asignada: ["en_atencion", "cancelada"],
  en_atencion: ["finalizada", "no_asistio"],
  finalizada: [],
  cancelada: [],
  no_asistio: [],
};

// Estados finales: la cita ya no cambia y la sala de video fue liberada
export const TERMINAL_APPOINTMENT_STATES: AppointmentStateCode[] = [
  "finalizada",
  "cancelada",
  "no_asistio",
];

// Estado efectivo. Mientras convivan versiones del backend, si `state`
// no viene se deriva de la bandera legacy.
export const getAppointmentState = (
  appointment: Appointment,
): AppointmentState => {
  if (appointment.state) return appointment.state;
  const code: AppointmentStateCode = appointment.isOccuped
    ? "asignada"
    : "libre";
  return { id: 0, code, ...APPOINTMENT_STATES[code] };
};

export const getAppointmentStateCode = (appointment: Appointment) =>
  getAppointmentState(appointment).code;

export const isTerminalState = (code: AppointmentStateCode) =>
  TERMINAL_APPOINTMENT_STATES.includes(code);

// ---- Reglas de UI ----

export const canAssign = (a: Appointment) =>
  getAppointmentStateCode(a) === "libre";

export const canCancel = (a: Appointment) =>
  getAppointmentStateCode(a) === "asignada";

export const canMarkNoShow = (a: Appointment) =>
  getAppointmentStateCode(a) === "en_atencion";

// Tiene paciente asignado (aplica para notas y datos del paciente)
export const hasPatient = (a: Appointment) =>
  getAppointmentStateCode(a) !== "libre";

// El scheduler corre cada minuto: al llegar start_hour la cita puede seguir
// "asignada" hasta ~60 s. Se acepta ese margen usando la ventana horaria.
export const canJoinVideoCall = (a: Appointment, now = new Date()) => {
  const code = getAppointmentStateCode(a);
  if (code === "en_atencion") return true;
  if (code !== "asignada") return false;
  const start = new Date(`${a.dateAppointment}T${a.startHour}`);
  const end = new Date(`${a.dateAppointment}T${a.endHour}`);
  return start <= now && now < end;
};

// Motivo por el que no se puede ingresar a la videollamada (null si se puede)
export const getVideoCallBlockedReason = (a: Appointment, now = new Date()) => {
  if (canJoinVideoCall(a, now)) return null;

  const { code, name } = getAppointmentState(a);
  if (code === "asignada") {
    const start = new Date(`${a.dateAppointment}T${a.startHour}`);
    return now < start ? "La cita aún no ha comenzado" : "La cita ya finalizó";
  }
  return `La cita está en estado "${name}"`;
};

// ---- Acciones que cambian el estado desde la UI ----

export type AppointmentStateAction = "cancel" | "no-show";

// Textos del diálogo de confirmación de cada acción
export const APPOINTMENT_STATE_ACTION_TEXTS: Record<
  AppointmentStateAction,
  {
    title: string;
    description: string;
    confirmLabel: string;
    notePlaceholder: string;
    successMessage: string;
  }
> = {
  cancel: {
    title: "Cancelar cita",
    description:
      "La cita quedará cancelada y el cupo no volverá a estar disponible.",
    confirmLabel: "Cancelar cita",
    notePlaceholder: "El paciente pidió cancelar",
    successMessage: "Cita cancelada",
  },
  "no-show": {
    title: "Marcar inasistencia",
    description: "Se registrará que el paciente no se conectó a la atención.",
    confirmLabel: "Marcar no asistió",
    notePlaceholder: "El paciente no se conectó",
    successMessage: "Se registró la inasistencia del paciente",
  },
};

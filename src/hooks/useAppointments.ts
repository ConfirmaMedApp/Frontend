import type {
  AppointmentRequest,
  AppointmentStateCode,
} from "@/interfaces/appointmentsInterface";
import { appointmentsService } from "@/services/appointemntsService";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

// Alineado con el scheduler del backend, que corre cada minuto
export const APPOINTMENTS_REFETCH_INTERVAL = 60_000;

// Invalida todas las vistas que muestran citas
const invalidateAppointmentQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["appointments"] }),
    queryClient.invalidateQueries({ queryKey: ["appointmentsDoctor"] }),
    queryClient.invalidateQueries({ queryKey: ["appointmentsByPatient"] }),
    queryClient.invalidateQueries({ queryKey: ["appointment"] }),
    queryClient.invalidateQueries({ queryKey: ["daysAppointments"] }),
  ]);

// Hook para obtener todas las agendas con parámetros opcionales
export const useAppointments = (params: {
  dateSelected: string;
  specialityId?: number | null;
  doctorId?: number | null;
  state?: AppointmentStateCode | null;
  limit?: number | null;
  offset?: number | null;
}) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () =>
      appointmentsService.getAllAppointmentsAdmin(
        params.dateSelected ?? "",
        params.specialityId ?? null,
        params.doctorId ?? null,
        params.state ?? null,
        params.limit ?? null,
        params.offset ?? null,
      ),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    // El estado de la cita puede cambiar sin intervención del usuario (scheduler)
    refetchInterval: APPOINTMENTS_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
};

// Hook para obtener las agendas del doctor autenticado con parámetros opcionales
export const useAppointmentsDoctor = (params: {
  dateSelected: string;
  specialityId?: number | null;
  limit?: number | null;
  offset?: number | null;
}) => {
  return useQuery({
    queryKey: ["appointmentsDoctor", params],
    queryFn: () =>
      appointmentsService.getAllAppointmentsDoctor(
        params.dateSelected ?? "",
        params.specialityId ?? null,
        params.limit ?? null,
        params.offset ?? null,
      ),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: APPOINTMENTS_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  });
};

// Hook para obtener una agenda por su ID. Acepta un intervalo opcional de refresco
// (lo usa la videollamada para detectar cuando la cita llega a un estado final)
export const useAppointmentById = (
  id: number,
  options?: { refetchInterval?: number | false },
) => {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: () => {
      if (!id) throw new Error("El ID de la agenda es requerido");
      return appointmentsService.getAppointmentById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
    refetchInterval: options?.refetchInterval ?? false,
  });
};

// Hook para obtener el historial de citas de un paciente específico
export const useAppointmentsByPatient = (
  patientId: number,
  params: {
    specialityId?: number | null;
    startDate?: string | null;
    limit?: number | null;
    offset?: number | null;
  },
) => {
  return useQuery({
    queryKey: ["appointmentsByPatient", patientId, params],
    queryFn: () => {
      if (!patientId) throw new Error("El ID del paciente es requerido");
      return appointmentsService.getAppointmentsByPatient(
        patientId,
        params.specialityId ?? null,
        params.startDate ?? null,
        params.limit ?? null,
        params.offset ?? null,
      );
    },
    enabled: !!patientId,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para obtener los días con citas para un año y mes específicos
export const useGetDaysForYearAndMonth = (year: number, month: number) => {
  return useQuery({
    queryKey: ["daysAppointments", year, month],
    queryFn: () =>
      appointmentsService.getDaysForYearAndMonth(year, month, null),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para crear una o varias agendas
export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (data: AppointmentRequest) =>
      appointmentsService.createAppointment(data),
  });
};

// Las mutaciones de estado usan onSettled (no onSuccess) para refrescar también
// cuando hay un 409: en ese caso el estado real de la cita cambió en el servidor.

// Hook para asignar una cita a un paciente
export const useAssignAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { appointmentId: number; patientId: number }) =>
      appointmentsService.assignAppointment(data),
    onSettled: () => invalidateAppointmentQueries(queryClient),
  });
};

// Hook para cancelar una cita asignada (con nota opcional)
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      note,
    }: {
      appointmentId: number;
      note?: string;
    }) => appointmentsService.cancelAppointment(appointmentId, note),
    onSettled: () => invalidateAppointmentQueries(queryClient),
  });
};

// Hook para marcar la inasistencia del paciente en una cita en atención (con nota opcional)
export const useMarkAppointmentNoShow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      note,
    }: {
      appointmentId: number;
      note?: string;
    }) => appointmentsService.markAppointmentNoShow(appointmentId, note),
    onSettled: () => invalidateAppointmentQueries(queryClient),
  });
};

// Hook para obtener las credenciales del doctor para unirse a la videollamada de una cita
export const useDoctorVideoToken = (appointmentId: number) => {
  return useQuery({
    queryKey: ["doctorVideoToken", appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error("El ID de la cita es requerido");
      return appointmentsService.getDoctorVideoToken(appointmentId);
    },
    enabled: !!appointmentId,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  });
};

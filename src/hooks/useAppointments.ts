import type { AppointmentRequest } from "@/interfaces/appointmentsInterface";
import { appointmentsService } from "@/services/appointemntsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener todas las agendas con parámetros opcionales
export const useAppointments = (params: {
  dateSelected: string;
  specialityId?: number | null;
  doctorId?: number | null;
  isOccupped?: boolean | null;
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
        params.isOccupped ?? null,
        params.limit ?? null,
        params.offset ?? null
      ),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para obtener las agendas del doctor autenticado con parámetros opcionales
export const useAppointmentsDoctor = (params: {
  dateSelected: string;
  specialityId?: number | null;
  isOccupped?: boolean | null;
  limit?: number | null;
  offset?: number | null;
}) => {
  return useQuery({
    queryKey: ["appointmentsDoctor", params],
    queryFn: () =>
      appointmentsService.getAllAppointmentsDoctor(
        params.dateSelected ?? "",
        params.specialityId ?? null,
        params.isOccupped ?? null,
        params.limit ?? null,
        params.offset ?? null
      ),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para obtener una agenda por su ID
export const useAppointmentById = (id: number) => {
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

// Hook para crear una o varias agendas
export const useAssignAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { appointmentId: number; patientId: number }) =>
      appointmentsService.assignAppointment(data),
    onSuccess: () => {
      // Aquí podrías invalidar queries relacionadas si es necesario
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointment"] });
      queryClient.invalidateQueries({ queryKey: ["daysAppointments"] });
    },
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

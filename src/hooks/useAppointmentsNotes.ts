import type { AppointmentNoteRequest } from "@/interfaces/appointmentsNotesInterface";
import { appointmentsNotesService } from "@/services/appointmentsNotesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener el historial de notas de una cita
export const useAppointmentNotes = (appointmentId: number) => {
  return useQuery({
    queryKey: ["appointmentNotes", appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error("El ID de la cita es requerido");
      return appointmentsNotesService.getNotesByAppointmentId(appointmentId);
    },
    enabled: !!appointmentId,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para crear una nueva nota sobre una cita
export const useCreateAppointmentNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentNoteRequest) =>
      appointmentsNotesService.createNote(data),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["appointmentNotes", appointmentId],
      });
    },
  });
};

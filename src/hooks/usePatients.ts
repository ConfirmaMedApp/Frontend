import type { PatientRequest, PatientUpdateRequest } from "@/interfaces/patientsInterface";
import { patientsService } from "@/services/patientsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener todos los pacientes con parámetros opcionales
export const usePatients = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
  status?: boolean | null;
}) => {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () =>
      patientsService.getAllPatients(
        params.limit ?? null,
        params.offset ?? null,
        params.search ?? null,
      ),
    staleTime: 0,
    refetchOnMount: "always"
  });
};

// Hook para obtener un paciente por su ID
export const usePatientById = (id: number) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => {
      if (!id) throw new Error("El ID del paciente es requerido");
      return patientsService.getPatientById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para crear un nuevo paciente
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientRequest) => patientsService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
};

// Hook para actualizar un paciente existente
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...data }: PatientUpdateRequest) =>
      patientsService.updatePatient(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
    },
  });
};

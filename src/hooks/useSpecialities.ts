import type {
  SpecialityRequest,
  SpecialityRequestUpdate,
} from "@/interfaces/specialitiesInterface";
import { specialityService } from "@/services/specialitiesService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener todas las especialidades con parámetros opcionales
export const useSpecialities = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
  status?: boolean | null;
}) => {
  return useQuery({
    queryKey: ["specialities", params],
    queryFn: () =>
      specialityService.getAllSpecialities(
        params.limit ?? null,
        params.offset ?? null,
        params.search ?? null,
        params.status ?? null
      ),
    staleTime: 0,
    refetchOnMount: "always"
  });
};

// Hook para obtener una especialidad por su ID
export const useSpecialityById = (id: number) => {
  return useQuery({
    queryKey: ["speciality", id],
    queryFn: () => {
      if (!id) throw new Error("El ID de la especialidad es requerido");
      return specialityService.getSpecialityById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para crear una nueva especialidad
export const useCreateSpeciality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SpecialityRequest) =>
      specialityService.createSpeciality(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
    },
  });
};

// Hook para actualizar una especialidad existente
export const useUpdateSpeciality = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...data }: SpecialityRequestUpdate) =>
      specialityService.updateSpeciality(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      queryClient.invalidateQueries({ queryKey: ["speciality", id] });
    },
  });
};

// Hook para agregar doctores a una especialidad
export const useAddDoctorsToSpeciality = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      specialityId,
      doctorIds,
    }: {
      specialityId: number;
      doctorIds: number[];
    }) => specialityService.addDoctorsToSpeciality({ specialityId, doctorIds }),
    onSuccess: (_, { specialityId }) => {
      queryClient.invalidateQueries({ queryKey: ["specialities"] });
      queryClient.invalidateQueries({ queryKey: ["speciality", specialityId] });
    },
  });
};

// Hook para obtener los doctores asociados a una especialidad
export const useDoctorsBySpeciality = (specialityId: number) => {
  return useQuery({
    queryKey: ["doctorsBySpeciality", specialityId],
    queryFn: () => {
      if (!specialityId)
        throw new Error("El ID de la especialidad es requerido");
      return specialityService.getDoctorsBySpeciality(specialityId);
    },
    enabled: !!specialityId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

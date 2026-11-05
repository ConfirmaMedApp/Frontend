import type {
  DoctorRequest,
  DoctorUpdateRequest,
  UpdateDoctorPhotoRequest,
} from "@/interfaces/doctorsInterface";
import { doctorsService } from "@/services/doctorsService";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

// Invalida todo lo que muestra datos de un doctor: listados, detalle, hoja de vida
// y listados por especialidad (estos últimos también traen descripción y foto)
const invalidateDoctor = (queryClient: QueryClient, id: number) => {
  queryClient.invalidateQueries({ queryKey: ["doctors"] });
  queryClient.invalidateQueries({ queryKey: ["doctor", id] });
  queryClient.invalidateQueries({ queryKey: ["doctorProfile", id] });
  queryClient.invalidateQueries({ queryKey: ["doctorsBySpeciality"] });
};

// Hook para obtener todos los doctores con parámetros opcionales
export const useDoctors = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
  status?: boolean | null;
  // Permite no consultar el listado general (p. ej. al filtrar por especialidad)
  enabled?: boolean;
}) => {
  const { enabled = true, ...filters } = params;

  return useQuery({
    queryKey: ["doctors", filters],
    queryFn: () =>
      doctorsService.getAllDoctors(
        filters.limit ?? null,
        filters.offset ?? null,
        filters.search ?? null,
        filters.status ?? null
      ),
    enabled,
    staleTime: 0,
    refetchOnMount: "always"
  });
};

// Hook para obtener un doctor por su ID
export const useDoctorById = (id: number) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => {
      if (!id) throw new Error("El ID del doctor es requerido");
      return doctorsService.getDoctorById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para obtener la hoja de vida de un doctor (con sus especialidades).
// `enabled` permite consultarla solo mientras el modal está abierto y así
// refrescarla cada vez que se abre.
export const useDoctorProfile = (id: number, enabled = true) => {
  return useQuery({
    queryKey: ["doctorProfile", id],
    queryFn: () => {
      if (!id) throw new Error("El ID del doctor es requerido");
      return doctorsService.getDoctorProfile(id);
    },
    enabled: enabled && !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para crear un nuevo doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorRequest) => doctorsService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

// Hook para actualizar un doctor existente
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...data }: DoctorUpdateRequest) =>
      doctorsService.updateDoctor(data),
    onSuccess: (_, { id }) => {
      invalidateDoctor(queryClient, id);
    },
  });
};

// Hook para subir o cambiar la foto de un doctor
export const useUpdateDoctorPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: UpdateDoctorPhotoRequest) =>
      doctorsService.updateDoctorPhoto(id, file),
    onSuccess: (_, { id }) => {
      invalidateDoctor(queryClient, id);
    },
  });
};

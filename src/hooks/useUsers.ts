import type {
  UpdateAvatarRequest,
  UserRequest,
  UserUpdateRequest,
} from "@/interfaces/usersInterface";
import { usersService } from "@/services/usersService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener todos los usuarios con parámetros opcionales
export const useUsers = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
  status?: boolean | null;
}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () =>
      usersService.getAllUsers(
        params.limit ?? null,
        params.offset ?? null,
        params.search ?? null,
        params.status ?? null
      ),
    staleTime: 0,
    refetchOnMount: "always"
  });
};

// Hook para obtener un doctor por su ID
export const useUserById = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => {
      if (!id) throw new Error("El ID del usuario es requerido");
      return usersService.getUserById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para crear un nuevo doctor
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserRequest) => usersService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Hook para actualizar un doctor existente
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...data }: UserUpdateRequest) =>
      usersService.updateUser(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

// Hook para obtener los avatares predefinidos disponibles
export const useAvatarPresets = () => {
  return useQuery({
    queryKey: ["avatarPresets"],
    queryFn: () => usersService.getAvatarPresets(),
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para actualizar el avatar de un usuario
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAvatarRequest & { id: number }) =>
      usersService.updateAvatar(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};

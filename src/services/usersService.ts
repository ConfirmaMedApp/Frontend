import axiosService from "@/config/axiosService";
import type {
  UserRequest,
  UserUpdateRequest,
} from "@/interfaces/usersInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para los usuarios
const API_URL = "/users";

// Funcion para obtener todos los usuarios con parametros opcionales
const getAllUsers = async (
  limit: number | null = null,
  offset: number | null = null,
  search: string | null = null,
  status: boolean | null = null
) => {
  try {
    const response = await axiosService.get(`${API_URL}`, {
      params: {
        limit,
        offset,
        search,
        status,
      },
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo los usuarios");
  }
};

// Funcion para obtener un usuario por su ID
const getUserById = async (id: number) => {
  try {
    const response = await axiosService.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error obteniendo el usuario");
  }
};

// Funcion para crear un nuevo usuario
const createUser = async (userData: UserRequest) => {
  try {
    const response = await axiosService.post(`${API_URL}`, userData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error creando el usuario");
  }
};

// Funcion para actualizar un usuario existente
const updateUser = async (userData: UserUpdateRequest) => {
  try {
    const response = await axiosService.put(`${API_URL}`, userData);
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error actualizando el usuario|");
  }
};

// Exportar el servicio de usuarios
export const usersService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
};

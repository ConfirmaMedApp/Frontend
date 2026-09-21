import type { Doctor } from "./doctorsInterface";
import type { Office } from "./officesInterface";

// Interface para obtener los usuarios
export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  username: string;
  office: Office;
  doctor: Doctor | null;
  status: boolean;
  role: string;
  avatarUrl?: string;
}

// Interfaz para crear un nuevo usuario
export interface UserRequest {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  doctorId: number | null;
  status: boolean;
  role: string;
  avatarPresetKey: string;
}

// Interfaz de un avatar predefinido
export interface AvatarPreset {
  key: string;
  url: string;
}

// Interfaz para actualizar el avatar de un usuario
export interface UpdateAvatarRequest {
  presetKey?: string;
  file?: File;
}

// Interfaz para actualizar un usuario existente
export interface UserUpdateRequest {
  id: number;
  name?: string;
  lastname?: string;
  email?: string;
  username?: string;
  password?: string;
  doctorId?: number | null;
  status?: boolean;
  role?: string;
}

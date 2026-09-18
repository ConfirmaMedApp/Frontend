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
  doctor: Doctor;
  status: boolean;
  role: string;
}

// Interfaz para crear un nuevo usuario
export interface UserRequest {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  doctorId: number;
  status: boolean;
  role: string;
}

// Interfaz para actualizar un usuario existente
export interface UserUpdateRequest {
  id: number;
  name?: string;
  lastname?: string;
  email?: string;
  username?: string;
  password?: string;
  doctorId?: number;
  status?: boolean;
  role?: string;
}

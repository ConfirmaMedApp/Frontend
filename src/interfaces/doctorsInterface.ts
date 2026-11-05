import type { Speciality } from "./specialitiesInterface";

// Interfaz para obtener los datos de la api de un doctor
export interface Doctor {
  id: number;
  name: string;
  lastName: string;
  document: string;
  documentType: {
    id: number;
    name: string;
    code?: string;
  };
  email: string;
  // Texto de la hoja de vida y foto: vienen null si el doctor aún no los tiene
  description?: string | null;
  photoUrl?: string | null;
  status: boolean;
}

// Hoja de vida del doctor: sus datos + descripción + foto + especialidades
export interface DoctorProfile extends Doctor {
  specialities: Speciality[];
}

// Interfaz para crear un nuevo doctor (la foto se sube aparte con UpdateDoctorPhotoRequest)
export interface DoctorRequest {
  name: string;
  lastName: string;
  document: string;
  documentTypeId: number;
  email: string;
  // Opcional (máx. 1000 caracteres): se puede omitir o mandar null
  description?: string | null;
  status: boolean;
}

// Interfaz para actualizar un doctor existente
export interface DoctorUpdateRequest extends DoctorRequest {
  id: number;
}

// Interfaz para subir o cambiar la foto de un doctor (multipart, el archivo es obligatorio)
export interface UpdateDoctorPhotoRequest {
  id: number;
  file: File;
}

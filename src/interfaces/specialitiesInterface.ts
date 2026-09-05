// Interfaz para obtener las especialidades
export interface Speciality {
  id: number;
  name: string;
  description?: string;
  code: string;
  status: boolean;
}

// Interfaz para crear una nueva especialidad
export interface SpecialityRequest {
  name: string;
  description?: string;
  code: string;
  status: boolean;
}

// Interfaz para actualizar una especialidad existente
export interface SpecialityRequestUpdate {
  id: number;
  name?: string;
  description?: string;
  code?: string;
  status?: boolean;
}

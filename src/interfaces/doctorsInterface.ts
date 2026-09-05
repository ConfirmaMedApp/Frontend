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
  status: boolean;
}

// Interfaz para crear un nuevo doctor
export interface DoctorRequest {
  name: string;
  lastName: string;
  document: string;
  documentTypeId: number;
  email: string;
  status: boolean;
}

// Interfaz para actualizar un doctor existente
export interface DoctorUpdateRequest extends DoctorRequest {
  id: number;
}

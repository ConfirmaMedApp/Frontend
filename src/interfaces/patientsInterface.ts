// Interfaz para obtener los datos de la api de un paciente
export interface Patient {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  birthdate: string;
  document: string;
  documentType: {
    id: number;
    name: string;
  };
  gender: {
    id: number;
    name: string;
  };
}

// Interfaz para crear un nuevo paciente
export interface PatientRequest {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  birthdate: string;
  document: string;
  documentTypeId: number;
  genderId: number;
}

// Interfaz extendida para actualizar un paciente
export interface PatientUpdateRequest extends PatientRequest {
  id: number;
}

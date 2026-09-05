// Interfaz para obtener las oficinas
export interface Office {
  id: number;
  name: string;
  description?: string;
  nit: string;
  brand: string;
  address: string;
  status: boolean;
}

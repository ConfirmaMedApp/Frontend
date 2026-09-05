import { officesService } from "@/services/officesService";
import { useQuery } from "@tanstack/react-query";

// Hook para obtener todas las oficinas con parámetros opcionales
export const useOffices = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
}) => {
  return useQuery({
    queryKey: ["offices", params],
    queryFn: () =>
      officesService.getAllOffices(
        params.limit ?? null,
        params.offset ?? null,
        params.search ?? null
      ),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

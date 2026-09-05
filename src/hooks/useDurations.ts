import { durationsService } from "@/services/durationsService";
import { useQuery } from "@tanstack/react-query";

// Hook para obtener todas las duraciones
export const useDurations = () => {
  return useQuery({
    queryKey: ["durations"],
    queryFn: () => durationsService.getAllDurations(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

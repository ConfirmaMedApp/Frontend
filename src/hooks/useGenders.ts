import { gendersService } from "@/services/gendersService";
import { useQuery } from "@tanstack/react-query";

// Hook para obtener todos los géneros
export const useGenders = () => {
  return useQuery({
    queryKey: ["genders"],
    queryFn: () => gendersService.getAllGenders(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

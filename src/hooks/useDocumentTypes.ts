import { documentTypesService } from "@/services/documentTypes";
import { useQuery } from "@tanstack/react-query";

// Hook para obtener todos los tipos de documento
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ["documentTyps"],
    queryFn: () => documentTypesService.getAllDocumentTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

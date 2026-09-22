import useAuth from "@/hooks/useAuth";
import { useUserById } from "@/hooks/useUsers";

// El login solo guarda id/nombre/token en localStorage; el rol real
// solo viene en el perfil completo del usuario (ver Sidebar/ProfileModal).
const useUserRole = () => {
  const { getInfoUser } = useAuth();
  const userId = getInfoUser()?.id || 0;
  const { data, isLoading } = useUserById(userId);

  return {
    role: data?.items?.role as string | undefined,
    isLoading,
  };
};

export default useUserRole;

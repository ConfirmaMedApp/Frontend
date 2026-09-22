import { Navigate } from "react-router-dom";
import useUserRole from "@/hooks/useUserRole";
import { getDefaultRouteForRole } from "@/config/roles";
import { Spinner } from "@/components/ui/spinner";

// Punto de entrada tras el login: envía a cada rol directamente a su
// vista principal (doctor -> Mis agendas, secretaria -> Crear agenda,
// resto -> Especialidades) en lugar de una ruta fija para todos.
const RoleHomeRedirect = () => {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <Spinner className="w-28 h-28" />
      </div>
    );
  }

  return <Navigate to={getDefaultRouteForRole(role)} replace />;
};

export default RoleHomeRedirect;

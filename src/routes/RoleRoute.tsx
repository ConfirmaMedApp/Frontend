import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import useUserRole from "@/hooks/useUserRole";
import { Spinner } from "@/components/ui/spinner";
import { hasRoleAccess, getDefaultRouteForRole } from "@/config/roles";

interface RoleRouteProps {
  allowedRoles: string[];
}

// Debe usarse anidado dentro de ProtectedRoute: asume que el usuario ya
// está autenticado y solo valida si su rol puede ver estas rutas.
const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { role, isLoading } = useUserRole();
  const allowed = hasRoleAccess(allowedRoles, role);

  useEffect(() => {
    if (!isLoading && !allowed) {
      toast.error("No tienes permisos para acceder a esta sección");
    }
  }, [isLoading, allowed]);

  if (isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <Spinner className="w-28 h-28" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

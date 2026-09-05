import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

const ProtectedRoute = () => {
  const { checkToken } = useAuth();
  const location = useLocation();
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean | null;
    isLoading: boolean;
  }>({
    isAuthenticated: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const verifyAuthentication = async () => {
      try {
        const isAuthenticated = await checkToken();

        if (isMounted) {
          setAuthState({
            isAuthenticated,
            isLoading: false,
          });

          if (!isAuthenticated) {
            toast.error("Debes iniciar sesión para acceder a esta página");
          }
        }
      } catch (error) {
        if (isMounted) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
          });
          console.log("Error verificando autenticación:", error);
          toast.error("Error de autenticación. Por favor, inicia sesión");
        }
      }
    };

    verifyAuthentication();

    return () => {
      isMounted = false;
    };
  }, [checkToken, location.pathname]);

  if (authState.isLoading) {
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="flex items-center flex-col">
          <Spinner className="w-28 h-28" />
          <p className="font-poppins mt-1 font-semibold">
            Verificando permisos del usuario...
          </p>
        </div>
      </div>
    );
  }

  if (authState.isAuthenticated === false) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

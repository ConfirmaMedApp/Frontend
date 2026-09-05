import { useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { authService } from "@/services/authService";

interface LoginCredentials {
  userName: string;
  password: string;
}

interface AuthHook {
  checkToken: () => Promise<boolean>;
  login: (
    credentials: LoginCredentials
  ) => Promise<{ id: number; fullName: string; token: string } | undefined>;
  logout: () => Promise<void>;
  getInfoUser: () => {
    id: number;
    userName: string;
    fullName: string;
    token: string;
  } | null;
}

const useAuth = (): AuthHook => {
  const navigate = useNavigate();

  const getInfoUser = useCallback((): {
    id: number;
    fullName: string;
    userName: string;
    token: string;
  } | null => {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  }, []);

  const checkToken = useCallback(async (): Promise<boolean> => {
    try {
      const userSession = JSON.parse(localStorage.getItem("user") || "{}");
      if (userSession && userSession.token) {
        return true;
      }

      return false;
    } catch (error) {
      localStorage.removeItem("user");
      console.log(error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logoutService();
      toast.success("Sesión cerrada exitosamente");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("user");
      toast.error("Ocurrió un error al cerrar sesión");
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<any> => {
      try {
        const response = await authService.loginService(credentials);
        // Guardar usuario y token en localStorage
        if (response && response.token) {
          localStorage.setItem("user", JSON.stringify(response));
          return response;
        } else {
          throw new Error("No se recibió el token del servidor");
        }
      } catch (error) {
        // handleAxiosError ya hace throw del error con el mensaje del backend
        throw new Error(
          (error as Error).message || "Usuario o contraseña incorrectos"
        );
      }
    },
    []
  );

  return {
    checkToken,
    login,
    logout,
    getInfoUser,
  };
};

export default useAuth;

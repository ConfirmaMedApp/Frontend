import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import ModeToggle from "@/components/custom/ModeToggle";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { User } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simular delay de autenticación
    setTimeout(async () => {
      // Usar el contexto de autenticación
      try {
        const response = await login({ userName: username, password });
        toast.success(
          `¡Bienvenido de nuevo, ${response?.fullName || "usuario"}!`
        );
        navigate("/home", { replace: true });
      } catch (error) {
        const errorMessage =
          (error as Error).message || "Usuario o contraseña incorrectos";
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-screen relative h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <Card className="h-fit w-full overflow-y-auto remove-scroll max-w-3xl px-4 py-8 flex flex-col md:flex-row justify-between items-center relative">
        {/* Contenedor principal que se vuelve flex en md+ */}
        <div className="w-full flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Ilustración - En móvil arriba, en md+ a la izquierda */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            <div className="w-fit mx-auto">
              <img
                src="/svgs/doctorsLogin.svg"
                alt="#doctoresLogin"
                className="w-36 lg:w-44 xl:w-60"
              />
            </div>
            <div className="flex items-center gap-1 flex-col text-center mt-4">
              <h1 className="font-bold text-2xl md:text-3xl">
                Confirma
                <span className="text-primary">Med</span>
              </h1>
              <p className="text-xs opacity-70 leading-relaxed max-w-md">
                Plataforma administrativa para la gestión centralizada de citas
                médicas, recepcionistas y atención especializada.
              </p>
            </div>
          </div>

          {/* Formulario - En móvil abajo, en md+ a la derecha */}
          <div className="w-full md:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-5 w-full">
              {error && (
                <div className="py-2 px-4 text-sm text-destructive bg-destructive/5 border border-destructive/15 rounded-lg animate-shake">
                  <div className="flex items-center gap-2">
                    <IconLock className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Nombre de usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold">
                    Contraseña
                  </Label>
                </div>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-5 w-5" />
                    ) : (
                      <IconEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full text-base font-semibold transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

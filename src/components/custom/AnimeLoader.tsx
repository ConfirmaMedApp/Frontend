import { useEffect, useState } from "react";
import VitaLogo from "./VitaLogo";

interface AnimeLoaderProps {
  onComplete?: () => void;
}

const AnimeLoader = ({ onComplete }: AnimeLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [currentModule, setCurrentModule] = useState("Inicializando...");

  const modules = [
    "Cargando configuración...",
    "Conectando base de datos...",
    "Inicializando módulos...",
    "Verificando permisos...",
    "Preparando interface...",
    "VitaApp listo!",
  ];

  useEffect(() => {
    // Simular progreso de carga
    let moduleIndex = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 70, 100);

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            onComplete?.();
          }, 300);
        }

        return newProgress;
      });

      if (moduleIndex < modules.length) {
        setCurrentModule(modules[moduleIndex]);
        moduleIndex++;
      }
    }, 500);

    return () => {
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center overflow-hidden z-50 fixed bg-background">
      {/* Logo VitaApp: sobre una placa clara para que se lea también en el tema oscuro */}
      <div className="mb-12 rounded-2xl bg-brand-ice px-4 py-3">
        <VitaLogo variant="full" className="w-72" />
      </div>

      {/* Información de progreso */}
      <div className="flex flex-col items-center space-y-4 mt-8 text-center max-w-md">
        {/* Texto del módulo actual */}
        <div className="text-xl font-semibold mb-2">{currentModule}</div>

        {/* Barra de progreso */}
        <div className="w-80 bg-muted-foreground/50 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-brand-teal rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Porcentaje */}
        <div className="text-sm font-mono text-muted-foreground">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Spinner decorativo */}
      <div className="mt-12">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default AnimeLoader;

import { cn } from "@/lib/utils";

type VitaLogoProps = {
  /**
   * - full: logo completo (icono, nombre y eslogan). Tiene letras azul marino
   *   y fondo transparente: ponerlo sobre una superficie clara.
   * - icon: icono en cuadro; cambia solo con el tema (blanco en claro, azul marino en oscuro).
   */
  variant?: "full" | "icon";
  className?: string;
};

const VitaLogo = ({ variant = "full", className }: VitaLogoProps) => {
  if (variant === "full") {
    return (
      <img
        src="/logos/LogoCompleto.png"
        alt="VitaApp: tu salud, más cerca"
        width={420}
        height={135}
        className={cn("h-auto", className)}
      />
    );
  }

  return (
    <>
      <img
        src="/logos/Logo.png"
        alt="VitaApp"
        width={52}
        height={52}
        className={cn("dark:hidden", className)}
      />
      <img
        src="/logos/LogoMonocromatica.png"
        alt="VitaApp"
        width={52}
        height={53}
        className={cn("hidden dark:block", className)}
      />
    </>
  );
};

export default VitaLogo;

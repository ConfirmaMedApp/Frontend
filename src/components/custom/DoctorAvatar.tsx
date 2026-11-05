import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DoctorAvatarProps {
  // URL de la foto (o de su previsualización); si no hay, se muestran las iniciales
  src?: string | null;
  name?: string;
  lastName?: string;
  className?: string;
}

// Iniciales (nombre + apellido) para el respaldo cuando el doctor no tiene foto
const getInitials = (name = "", lastName = "") =>
  `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase() || "?";

const DoctorAvatar = ({
  src,
  name,
  lastName,
  className,
}: DoctorAvatarProps) => {
  return (
    <Avatar className={className}>
      {/* object-cover: las fotos no siempre son cuadradas y no deben deformarse */}
      <AvatarImage
        src={src ?? undefined}
        alt={`${name ?? ""} ${lastName ?? ""}`.trim()}
        className="object-cover"
      />
      <AvatarFallback className="font-medium">
        {getInitials(name, lastName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default DoctorAvatar;

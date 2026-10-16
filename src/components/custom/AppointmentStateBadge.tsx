import { getAppointmentState } from "@/config/appointmentStates";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import { cn } from "@/lib/utils";

interface StateBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
}

// Pinta un estado con su `name` y `color`. `color-mix` produce el fondo
// translúcido sin asumir el formato del color.
export const StateBadge = ({
  name,
  color,
  size = "md",
  className,
}: StateBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
      size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
      className,
    )}
    style={{
      color,
      backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
    }}
  >
    <span
      className="size-1.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
    {name}
  </span>
);

interface AppointmentStateBadgeProps {
  appointment: Appointment;
  size?: "sm" | "md";
  className?: string;
}

// Pinta el estado de la cita con el `name` y `color` que envía el backend
const AppointmentStateBadge = ({
  appointment,
  size,
  className,
}: AppointmentStateBadgeProps) => {
  const { name, color } = getAppointmentState(appointment);

  return (
    <StateBadge name={name} color={color} size={size} className={className} />
  );
};

export default AppointmentStateBadge;

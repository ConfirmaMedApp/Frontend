import { getAppointmentState } from "@/config/appointmentStates";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import { cn } from "@/lib/utils";

interface AppointmentStateBadgeProps {
  appointment: Appointment;
  size?: "sm" | "md";
  className?: string;
}

// Pinta el estado con el `name` y `color` que envía el backend. `color-mix`
// produce el fondo translúcido sin asumir el formato del color.
const AppointmentStateBadge = ({
  appointment,
  size = "md",
  className,
}: AppointmentStateBadgeProps) => {
  const { name, color } = getAppointmentState(appointment);

  return (
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
};

export default AppointmentStateBadge;

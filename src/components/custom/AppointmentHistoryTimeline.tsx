import { StateBadge } from "@/components/custom/AppointmentStateBadge";
import { APPOINTMENT_HISTORY_REASON_LABELS } from "@/config/appointmentStates";
import { useAppointmentHistory } from "@/hooks/useAppointments";
import type { AppointmentHistoryEntry } from "@/interfaces/appointmentsInterface";
import { parseServerDate } from "@/utils/dates";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowRight } from "lucide-react";

interface AppointmentHistoryTimelineProps {
  appointmentId: number;
}

// Línea de tiempo con los cambios de estado de una cita, del más antiguo al más
// reciente (el orden en que los entrega el backend).
const AppointmentHistoryTimeline = ({
  appointmentId,
}: AppointmentHistoryTimelineProps) => {
  const { data, isLoading, isError } = useAppointmentHistory(appointmentId);
  const entries: AppointmentHistoryEntry[] = data?.items ?? [];

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Cargando historial...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive text-center py-4">
        No se pudo cargar el historial de estados.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Esta cita aún no tiene cambios de estado registrados.
      </p>
    );
  }

  return (
    <ol className="relative ml-2 space-y-4 border-l pl-5">
      {entries.map((entry) => {
        const reasonLabel = entry.reason
          ? (APPOINTMENT_HISTORY_REASON_LABELS[entry.reason] ?? entry.reason)
          : null;
        // `changedBy` null = lo hizo el sistema (transición automática)
        const author = entry.changedBy
          ? `${entry.changedBy.name} ${entry.changedBy.lastname}`
          : "Sistema";

        return (
          <li key={entry.id} className="relative">
            <span
              className="absolute -left-[26px] top-1 size-2.5 rounded-full ring-4 ring-background"
              style={{ backgroundColor: entry.toState.color }}
              aria-hidden
            />

            <div className="flex flex-wrap items-center gap-1.5">
              {entry.fromState ? (
                <>
                  <StateBadge
                    name={entry.fromState.name}
                    color={entry.fromState.color}
                    size="sm"
                  />
                  <ArrowRight className="size-3 text-muted-foreground" />
                </>
              ) : (
                // Sin estado de origen: es el primer registro (creación del cupo)
                <span className="text-xs text-muted-foreground">
                  Cupo creado
                </span>
              )}
              <StateBadge
                name={entry.toState.name}
                color={entry.toState.color}
                size="sm"
              />
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {reasonLabel && (
                <>
                  <span className="font-medium text-foreground">
                    {reasonLabel}
                  </span>
                  {" · "}
                </>
              )}
              {author} ·{" "}
              {format(parseServerDate(entry.createdAt), "d MMM yyyy, HH:mm", {
                locale: es,
              })}
            </p>

            {entry.note && (
              <p className="mt-1 rounded-md bg-muted px-2 py-1 text-xs break-words">
                {entry.note}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default AppointmentHistoryTimeline;

import { toast } from "sonner";
import { isApiError } from "@/utils/handleAxiosError";

// 409: la transición ya no es válida (otro usuario o el scheduler cambió la cita).
// Las mutaciones invalidan en onSettled, así que la vista se refresca sola.
export const notifyAppointmentError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : fallback;

  if (isApiError(error) && error.status === 409) {
    toast.warning(message, {
      description: "El estado de la cita cambió. La información se actualizó.",
    });
    return;
  }

  if (isApiError(error) && error.status === 404) {
    toast.error("La cita ya no existe. Se actualizó el listado.");
    return;
  }

  toast.error(message);
};

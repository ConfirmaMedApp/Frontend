import { isPaymentSettled } from "@/config/paymentStates";
import type {
  DoctorSpecialityPriceFilters,
  SetDoctorSpecialityPriceRequest,
} from "@/interfaces/paymentsInterface";
import { paymentsService } from "@/services/paymentsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

// La confirmación del pago llega al backend por webhook (asíncrona), así que la UI
// consulta GET .../payment: cada ~4 s durante ~2 min (el webhook suele confirmar en segundos).
export const PAYMENT_POLL_INTERVAL = 4_000;
export const PAYMENT_POLL_TIMEOUT = 120_000;

// ---- Precios (doctor + especialidad) ----

// Hook para listar los precios. Ambos filtros son opcionales y combinables. Sin filtros el
// endpoint devuelve todo, por eso `enabled` permite apagar la consulta cuando aún no hay contexto.
export const useDoctorSpecialityPrices = (
  params: DoctorSpecialityPriceFilters & { enabled?: boolean } = {},
) => {
  const { doctorId = null, specialityId = null, enabled = true } = params;

  return useQuery({
    queryKey: ["doctorSpecialityPrices", doctorId, specialityId],
    queryFn: () =>
      paymentsService.getDoctorSpecialityPrices({ doctorId, specialityId }),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });
};

// Hook para fijar o actualizar el precio (USD) de una combinación doctor + especialidad
export const useSetDoctorSpecialityPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetDoctorSpecialityPriceRequest) =>
      paymentsService.setDoctorSpecialityPrice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorSpecialityPrices"] });
      // Una cita sin precio usa como respaldo el precio actual del combo
      queryClient.invalidateQueries({ queryKey: ["appointmentPricing"] });
    },
  });
};

// ---- Cobro de la cita ----

// Hook para obtener el valor de la cita (USD y su conversión a COP con la TRM vigente)
export const useAppointmentPricing = (
  appointmentId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ["appointmentPricing", appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error("El ID de la cita es requerido");
      return paymentsService.getAppointmentPricing(appointmentId);
    },
    enabled: !!appointmentId && enabled,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para generar (o regenerar) el enlace de pago de una cita, con envío opcional por correo
export const useCreatePaymentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      sendEmail,
    }: {
      appointmentId: number;
      sendEmail?: boolean;
    }) => paymentsService.createPaymentLink(appointmentId, sendEmail),
    onSuccess: (_, { appointmentId }) => {
      queryClient.invalidateQueries({
        queryKey: ["appointmentPayment", appointmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["appointmentPricing", appointmentId],
      });
    },
  });
};

// Hook para pedir la configuración firmada del Widget / Checkout Web embebido.
// Cada llamada genera una referencia nueva, por eso es una mutación y no una consulta.
export const useCreateCheckoutConfig = () => {
  return useMutation({
    mutationFn: (appointmentId: number) =>
      paymentsService.createCheckoutConfig(appointmentId),
  });
};

// Hook para consultar el estado de pago de una cita. Con `pollUntil` (marca de tiempo) reintenta
// cada PAYMENT_POLL_INTERVAL hasta ese momento, o hasta que el pago quede resuelto: `PAID`, o la
// transacción en `DECLINED`/`VOIDED`/`ERROR`. Sin `pollUntil` hace una consulta normal.
export const useAppointmentPayment = (
  appointmentId: number,
  options: { enabled?: boolean; pollUntil?: number | null } = {},
) => {
  const { enabled = true, pollUntil = null } = options;

  return useQuery({
    queryKey: ["appointmentPayment", appointmentId],
    queryFn: () => {
      if (!appointmentId) throw new Error("El ID de la cita es requerido");
      return paymentsService.getAppointmentPayment(appointmentId);
    },
    enabled: !!appointmentId && enabled,
    staleTime: 0,
    refetchOnMount: "always",
    // Quien vuelve a la pestaña después de que el paciente pagó ve el estado al día
    refetchOnWindowFocus: true,
    retry: false,
    refetchInterval: (data) => {
      if (!pollUntil || Date.now() >= pollUntil) return false;
      if (isPaymentSettled(data?.items)) return false;
      return PAYMENT_POLL_INTERVAL;
    },
  });
};

// Estado de pago de la cita con polling controlado. Lo usan el diálogo de pago, la pantalla
// de cobro embebido y la página de resultado.
//   - `autoStart`: abre la ventana de polling al detectar un enlace pendiente de pago.
//   - `startPolling()`: la abre a mano (tras generar un enlace, o con "Verificar de nuevo").
//   - `isPolling`: la ventana sigue abierta y el pago aún no se resuelve.
//   - `timedOut`: la ventana venció sin confirmación; se puede volver a abrir.
export const usePaymentPolling = (
  appointmentId: number,
  options: { enabled?: boolean; autoStart?: boolean } = {},
) => {
  const { enabled = true, autoStart = true } = options;

  const [pollUntil, setPollUntil] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const query = useAppointmentPayment(appointmentId, {
    enabled,
    pollUntil: timedOut ? null : pollUntil,
  });

  const payment = query.data?.items;
  const settled = isPaymentSettled(payment);

  const startPolling = useCallback(() => {
    setTimedOut(false);
    setPollUntil(Date.now() + PAYMENT_POLL_TIMEOUT);
  }, []);

  // Si al abrir ya hay un enlace pendiente de pago, arranca la ventana sola
  useEffect(() => {
    if (!autoStart || pollUntil !== null) return;
    if (
      payment?.transactionStatus === "PENDING" &&
      payment.paymentStatus !== "PAID"
    ) {
      startPolling();
    }
  }, [
    autoStart,
    pollUntil,
    payment?.transactionStatus,
    payment?.paymentStatus,
    startPolling,
  ]);

  // Cierra la ventana cuando vence. Sin esto la UI se quedaría en "verificando" para
  // siempre, porque el último refetch no cambia los datos y no provoca otro render.
  useEffect(() => {
    if (pollUntil === null) return;
    const remaining = pollUntil - Date.now();
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(timer);
  }, [pollUntil]);

  return {
    query,
    payment,
    isPolling: pollUntil !== null && !timedOut && !settled,
    timedOut: timedOut && !settled,
    startPolling,
  };
};

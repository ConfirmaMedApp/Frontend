import type {
  AppointmentPayment,
  PaymentStatus,
  TransactionStatus,
} from "@/interfaces/paymentsInterface";

// Catálogo local de estados de pago. El backend solo manda el código (`UNPAID`/`PAID`
// y el estado de la transacción de Wompi), así que nombre y color se resuelven aquí.

// Estado de pago de la cita
export const PAYMENT_STATUSES: Record<
  PaymentStatus,
  { name: string; color: string }
> = {
  UNPAID: { name: "Sin pagar", color: "#f59e0b" },
  PAID: { name: "Pagada", color: "#22c55e" },
};

// Estado de la transacción en Wompi
export const TRANSACTION_STATUSES: Record<
  TransactionStatus,
  { name: string; color: string; description: string }
> = {
  PENDING: {
    name: "Pendiente",
    color: "#3b82f6",
    description: "Enlace generado, aún sin pagar o en proceso.",
  },
  APPROVED: {
    name: "Aprobada",
    color: "#22c55e",
    description: "Pago aprobado: la cita pasa a pagada.",
  },
  DECLINED: {
    name: "Rechazada",
    color: "#ef4444",
    description: "El pago fue rechazado.",
  },
  VOIDED: {
    name: "Anulada",
    color: "#6b7280",
    description: "El pago fue anulado.",
  },
  ERROR: {
    name: "Con error",
    color: "#a855f7",
    description: "Ocurrió un error durante el pago.",
  },
};

// Estados de la transacción con los que el pago ya no se va a aprobar
export const FAILED_TRANSACTION_STATUSES: TransactionStatus[] = [
  "DECLINED",
  "VOIDED",
  "ERROR",
];

export const isPaymentPaid = (payment: AppointmentPayment | undefined | null) =>
  payment?.paymentStatus === "PAID";

export const isPaymentFailed = (
  payment: AppointmentPayment | undefined | null,
) =>
  !!payment?.transactionStatus &&
  FAILED_TRANSACTION_STATUSES.includes(payment.transactionStatus);

// El pago quedó resuelto (aprobado o fallido): ya no hace falta seguir consultando.
// Es la condición de parada del polling descrita en la guía de pagos.
export const isPaymentSettled = (
  payment: AppointmentPayment | undefined | null,
) => isPaymentPaid(payment) || isPaymentFailed(payment);

import { StateBadge } from "@/components/custom/AppointmentStateBadge";
import { PAYMENT_STATUSES, TRANSACTION_STATUSES } from "@/config/paymentStates";
import type {
  PaymentStatus,
  TransactionStatus,
} from "@/interfaces/paymentsInterface";

// Gris para un estado que el catálogo local no conoce (el backend podría agregar uno nuevo)
const FALLBACK_COLOR = "#6b7280";

interface BadgeProps<T> {
  status: T;
  size?: "sm" | "md";
  className?: string;
}

// Estado de pago de la cita (UNPAID / PAID)
export const PaymentStatusBadge = ({
  status,
  size,
  className,
}: BadgeProps<PaymentStatus>) => {
  const known = PAYMENT_STATUSES[status];

  return (
    <StateBadge
      name={known?.name ?? status}
      color={known?.color ?? FALLBACK_COLOR}
      size={size}
      className={className}
    />
  );
};

// Estado de la transacción de Wompi (PENDING / APPROVED / DECLINED / VOIDED / ERROR)
export const TransactionStatusBadge = ({
  status,
  size,
  className,
}: BadgeProps<TransactionStatus>) => {
  const known = TRANSACTION_STATUSES[status];

  return (
    <StateBadge
      name={known?.name ?? status}
      color={known?.color ?? FALLBACK_COLOR}
      size={size}
      className={className}
    />
  );
};

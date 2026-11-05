import InlineNotice from "@/components/custom/InlineNotice";
import {
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/components/custom/PaymentStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  TRANSACTION_STATUSES,
  isPaymentFailed,
  isPaymentPaid,
} from "@/config/paymentStates";
import type { AppointmentPayment } from "@/interfaces/paymentsInterface";
import { cn } from "@/lib/utils";
import { formatCop, formatUsd } from "@/utils/currency";
import { parseServerDate } from "@/utils/dates";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Copy, ExternalLink, MessageCircle, RefreshCw } from "lucide-react";
import { useId } from "react";
import { toast } from "sonner";

// Las fechas del backend (expiresAt, paidAt) traen zona horaria: se muestran en hora local
const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = parseServerDate(value);
  return isValid(date) ? format(date, "d MMM yyyy, HH:mm", { locale: es }) : value;
};

// Mensaje precargado para compartir el enlace (p. ej. por WhatsApp)
const buildWhatsappUrl = (checkoutUrl: string) =>
  `https://wa.me/?text=${encodeURIComponent(
    `Hola, este es el enlace para pagar tu cita médica: ${checkoutUrl}`,
  )}`;

const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("Enlace copiado");
  } catch {
    toast.error("No se pudo copiar el enlace. Cópielo manualmente.");
  }
};

interface PaymentStatusPanelProps {
  payment?: AppointmentPayment;
  isLoading: boolean;
  error?: unknown;
  // La ventana de polling sigue abierta y el pago aún no se resuelve
  isPolling: boolean;
  // La ventana de polling venció sin confirmación
  timedOut: boolean;
  isRefreshing?: boolean;
  // Consulta de nuevo (y reabre la ventana de polling)
  onRefresh: () => void;
}

// Estado de pago de la cita (GET .../payment): estado de la cita, estado de la transacción de
// Wompi, el último enlace con sus acciones (copiar, abrir, compartir) y el avance del polling.
const PaymentStatusPanel = ({
  payment,
  isLoading,
  error,
  isPolling,
  timedOut,
  isRefreshing = false,
  onRefresh,
}: PaymentStatusPanelProps) => {
  const linkInputId = useId();

  const paid = isPaymentPaid(payment);
  const failed = isPaymentFailed(payment);
  // Un enlace de un solo uso ya no sirve si venció sin pago
  const expired =
    !paid && !!payment?.expiresAt && parseServerDate(payment.expiresAt) < new Date();
  const failedDescription =
    failed && payment?.transactionStatus
      ? TRANSACTION_STATUSES[payment.transactionStatus]?.description
      : undefined;

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">Estado del pago</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error && !payment ? (
        <InlineNotice
          variant="error"
          title="No se pudo consultar el estado del pago"
        >
          {error instanceof Error
            ? error.message
            : "Intente de nuevo en unos segundos."}
        </InlineNotice>
      ) : payment ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.paymentStatus} />
            {payment.transactionStatus && (
              <>
                <span className="text-xs text-muted-foreground">
                  Transacción:
                </span>
                <TransactionStatusBadge status={payment.transactionStatus} />
              </>
            )}
          </div>

          {/* Aviso principal según cómo va el pago */}
          {paid ? (
            <InlineNotice variant="success" title="Pago confirmado">
              Pagada el {formatDateTime(payment.paidAt)}.
            </InlineNotice>
          ) : failed ? (
            <InlineNotice variant="error" title="El pago no fue aprobado">
              {failedDescription} Genere un nuevo enlace para que el paciente
              intente de nuevo.
            </InlineNotice>
          ) : isPolling ? (
            <InlineNotice
              variant="info"
              title="Esperando la confirmación del pago"
              icon={
                <Spinner className="mt-0.5 shrink-0 text-primary" aria-hidden />
              }
            >
              Wompi avisa al sistema en segundos; este estado se actualiza solo.
            </InlineNotice>
          ) : timedOut ? (
            <InlineNotice variant="warning" title="Aún no hay confirmación">
              Si el paciente ya pagó, puede tardar un poco más.{" "}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={onRefresh}
              >
                Verificar de nuevo
              </Button>
            </InlineNotice>
          ) : expired ? (
            <InlineNotice variant="warning" title="El enlace venció">
              Genere uno nuevo para cobrar la cita.
            </InlineNotice>
          ) : !payment.paymentLinkId ? (
            <InlineNotice variant="info" title="Aún no hay un enlace de pago">
              Genere uno para poder cobrar esta cita.
            </InlineNotice>
          ) : null}

          {(payment.amountUsd != null ||
            payment.paymentLinkId ||
            payment.paidAt ||
            payment.expiresAt) && (
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              {payment.amountUsd != null && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Valor del último enlace
                  </dt>
                  <dd className="font-medium">
                    {formatUsd(payment.amountUsd)}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      · {formatCop(payment.amountCop)} {payment.currency}
                    </span>
                  </dd>
                </div>
              )}
              {payment.paymentLinkId && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    ID del enlace
                  </dt>
                  <dd className="font-mono text-xs">{payment.paymentLinkId}</dd>
                </div>
              )}
              {paid ? (
                <div>
                  <dt className="text-xs text-muted-foreground">Pagada el</dt>
                  <dd>{formatDateTime(payment.paidAt)}</dd>
                </div>
              ) : payment.expiresAt ? (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Vence el enlace
                  </dt>
                  <dd>{formatDateTime(payment.expiresAt)}</dd>
                </div>
              ) : null}
            </dl>
          )}

          {/* Enlace vigente para abrir o compartir con el paciente */}
          {payment.checkoutUrl && !paid && (
            <div className="space-y-1.5">
              <Label htmlFor={linkInputId}>Enlace de pago</Label>
              <div className="flex items-center gap-2">
                <Input
                  id={linkInputId}
                  readOnly
                  value={payment.checkoutUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Copiar enlace"
                  aria-label="Copiar enlace"
                  onClick={() => copyToClipboard(payment.checkoutUrl as string)}
                >
                  <Copy />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  title="Abrir enlace"
                  aria-label="Abrir enlace"
                >
                  <a
                    href={payment.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  title="Compartir por WhatsApp"
                  aria-label="Compartir por WhatsApp"
                >
                  <a
                    href={buildWhatsappUrl(payment.checkoutUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle />
                  </a>
                </Button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default PaymentStatusPanel;

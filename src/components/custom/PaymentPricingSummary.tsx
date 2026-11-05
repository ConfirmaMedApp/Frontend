import InlineNotice from "@/components/custom/InlineNotice";
import { PaymentStatusBadge } from "@/components/custom/PaymentStatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppointmentPricing } from "@/interfaces/paymentsInterface";
import { formatCop, formatTrm, formatUsd } from "@/utils/currency";

interface PaymentPricingSummaryProps {
  pricing?: AppointmentPricing;
  isLoading: boolean;
  error?: unknown;
}

// Valor de la cita antes de generar el enlace: precio en USD y su equivalente en COP con la
// TRM vigente. No convierte nada: muestra lo que devuelve el backend.
const PaymentPricingSummary = ({
  pricing,
  isLoading,
  error,
}: PaymentPricingSummaryProps) => {
  const hasPrice = pricing != null && pricing.priceUsd != null;

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-sm">Valor de la cita</h4>
        {pricing && (
          <PaymentStatusBadge status={pricing.paymentStatus} size="sm" />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : error && !pricing ? (
        <InlineNotice variant="error" title="No se pudo obtener el valor">
          {error instanceof Error
            ? error.message
            : "Intente de nuevo en unos segundos."}
        </InlineNotice>
      ) : pricing && !hasPrice ? (
        // priceUsd null: la cita no tiene precio, y trm/priceCop vienen en 0
        <InlineNotice
          variant="warning"
          title="La cita no tiene precio configurado"
        >
          Defina el precio del doctor para esta especialidad (Especialidades →
          Configurar precios) y vuelva a abrir esta ventana.
        </InlineNotice>
      ) : pricing ? (
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Precio (USD)</dt>
            <dd className="font-semibold">{formatUsd(pricing.priceUsd)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">TRM (COP por USD)</dt>
            <dd className="font-semibold">{formatTrm(pricing.trm)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Equivalente a cobrar
            </dt>
            <dd className="font-semibold">
              {formatCop(pricing.priceCop)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                {pricing.currency}
              </span>
            </dd>
          </div>
        </dl>
      ) : null}

      <p className="text-xs text-muted-foreground">
        El precio se define en USD, pero Wompi solo cobra en pesos colombianos
        (COP): al pagar se convierte con la TRM oficial del día. El paciente paga
        con su tarjeta internacional y su banco hace la conversión a su moneda
        local.
      </p>
    </div>
  );
};

export default PaymentPricingSummary;

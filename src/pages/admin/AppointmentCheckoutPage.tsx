import AppointmentStateBadge from "@/components/custom/AppointmentStateBadge";
import InlineNotice from "@/components/custom/InlineNotice";
import PaymentPricingSummary from "@/components/custom/PaymentPricingSummary";
import PaymentStatusPanel from "@/components/custom/PaymentStatusPanel";
import WompiWidgetButton from "@/components/custom/WompiWidgetButton";
import Container from "@/components/partials/Container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { canGeneratePaymentLink } from "@/config/appointmentStates";
import { isPaymentPaid } from "@/config/paymentStates";
import { useAppointmentById } from "@/hooks/useAppointments";
import {
  useAppointmentPricing,
  useCreateCheckoutConfig,
  usePaymentPolling,
} from "@/hooks/usePayments";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import type { CheckoutConfig } from "@/interfaces/paymentsInterface";
import { formatCop, formatTrm, formatUsd } from "@/utils/currency";
import { formatHour } from "@/utils/dates";
import { buildWompiCheckoutUrl, savePendingPayment } from "@/utils/wompi";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, CreditCard, ExternalLink, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

// Cobro embebido de una cita con el Widget o el Checkout Web de Wompi (flujo de la guía §9).
//
// Vive en su propia pantalla (y no en un diálogo) porque el Widget abre un overlay propio en
// el <body> y el bloqueo de foco y de clics de los diálogos modales de Radix lo deja inutilizable.
// Es una pantalla autenticada: `checkout-config` requiere JWT, igual que el resto de la guía.
const AppointmentCheckoutPage = () => {
  const { appointmentId } = useParams();
  const id = Number(appointmentId) || 0;

  const navigate = useNavigate();
  const location = useLocation();

  // El diálogo de pago manda la ruta de origen para poder volver exactamente ahí
  const returnTo: string =
    typeof location.state?.from === "string" ? location.state.from : "/home";

  // Configuración firmada vigente. Cada llamada genera una referencia nueva, por eso no se
  // pide sola al abrir la pantalla: solo cuando se pulsa "Preparar pago".
  const [config, setConfig] = useState<CheckoutConfig | null>(null);

  const appointmentQuery = useAppointmentById(id);
  const appointment: Appointment | undefined = appointmentQuery.data?.items;

  const pricingQuery = useAppointmentPricing(id);
  const { query: paymentQuery, payment, isPolling, timedOut, startPolling } =
    usePaymentPolling(id);
  const checkoutConfigMutation = useCreateCheckoutConfig();

  const pricing = pricingQuery.data?.items;
  const isPaid = isPaymentPaid(payment) || pricing?.paymentStatus === "PAID";
  // priceUsd null: la cita no tiene precio y el backend respondería 400 al pedir la configuración
  const noPrice = !!pricing && pricing.priceUsd == null;
  const canCharge = !appointment || canGeneratePaymentLink(appointment);

  const goBack = () => navigate(returnTo);

  // Reconsulta el estado y reabre la ventana de polling (botón "Actualizar")
  const handleRefresh = () => {
    startPolling();
    paymentQuery.refetch();
  };

  const handlePrepare = async () => {
    try {
      const response = await checkoutConfigMutation.mutateAsync(id);
      const nextConfig = response?.items;
      if (!nextConfig) {
        throw new Error("No se recibió la configuración del checkout");
      }
      setConfig(nextConfig);

      // Al terminar, Wompi redirige a la página de resultado del frontend y la app se
      // recarga: se recuerda qué cita se estaba cobrando para mostrar su desenlace
      savePendingPayment({
        appointmentId: id,
        reference: nextConfig.reference,
        returnTo,
        startedAt: Date.now(),
      });

      toast.success(
        response?.message || "Configuración de checkout generada satisfactoriamente",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo generar la configuración del checkout",
      );
    }
  };

  return (
    <Container
      titleModule="Cobro de la cita"
      description="Pago dentro de la app con el Widget o el Checkout Web de Wompi."
      icon={<CreditCard size={30} />}
      showButtons={false}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4 pb-6">
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft />
            Volver
          </Button>
        </div>

        {!id ? (
          <InlineNotice variant="error" title="Cita no válida">
            El identificador de la cita no es válido.
          </InlineNotice>
        ) : appointmentQuery.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : appointmentQuery.isError || !appointment ? (
          <InlineNotice variant="error" title="No se encontró la cita">
            {appointmentQuery.error instanceof Error
              ? appointmentQuery.error.message
              : "Puede que ya no exista. Vuelva e intente de nuevo."}
          </InlineNotice>
        ) : (
          <>
            {/* Cita */}
            <div className="rounded-md border p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm">Cita #{appointment.id}</h4>
                <AppointmentStateBadge appointment={appointment} size="sm" />
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  {format(
                    parseISO(appointment.dateAppointment),
                    "d 'de' MMMM 'de' yyyy",
                    { locale: es },
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Hora:</span>{" "}
                  {formatHour(appointment.startHour)} -{" "}
                  {formatHour(appointment.endHour)}
                </div>
                <div>
                  <span className="text-muted-foreground">Especialidad:</span>{" "}
                  {appointment.speciality.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Doctor:</span>{" "}
                  {appointment.doctor.name} {appointment.doctor.lastName}
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Paciente:</span>{" "}
                  {appointment.patient
                    ? `${appointment.patient.name} ${appointment.patient.lastname}`
                    : "-"}
                </div>
              </div>
            </div>

            <PaymentPricingSummary
              pricing={pricing}
              isLoading={pricingQuery.isLoading}
              error={pricingQuery.error}
            />

            <PaymentStatusPanel
              payment={payment}
              isLoading={paymentQuery.isLoading}
              error={paymentQuery.error}
              isPolling={isPolling}
              timedOut={timedOut}
              isRefreshing={paymentQuery.isFetching}
              onRefresh={handleRefresh}
            />

            {/* Pago embebido */}
            <div className="rounded-md border p-4 space-y-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-sm">Pago con Wompi</h4>
                <p className="text-xs text-muted-foreground">
                  El sistema genera una referencia única y firmada para esta cita.
                  Con esos valores se muestra el Widget (botón que abre el pago en
                  una ventana) o se puede ir al Checkout Web de Wompi.
                </p>
              </div>

              {isPaid ? (
                <InlineNotice variant="success" title="La cita ya está pagada">
                  No hace falta cobrarla de nuevo.
                </InlineNotice>
              ) : !canCharge ? (
                <InlineNotice variant="warning" title="La cita está cancelada">
                  No se genera un cobro para una cita cancelada.
                </InlineNotice>
              ) : !config ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handlePrepare}
                    disabled={
                      noPrice ||
                      pricingQuery.isLoading ||
                      checkoutConfigMutation.isPending
                    }
                  >
                    {checkoutConfigMutation.isPending ? (
                      <Spinner />
                    ) : (
                      <CreditCard />
                    )}
                    Preparar pago
                  </Button>
                  {noPrice && (
                    <p className="text-xs text-muted-foreground">
                      Defina primero el precio del doctor para esta especialidad.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Precio (USD)
                      </dt>
                      <dd className="font-semibold">
                        {formatUsd(config.amountUsd)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        TRM (COP por USD)
                      </dt>
                      <dd className="font-semibold">{formatTrm(config.trm)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">A cobrar</dt>
                      <dd className="font-semibold">
                        {formatCop(config.amountCop)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {config.currency}
                        </span>
                      </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <dt className="text-xs text-muted-foreground">
                        Referencia
                      </dt>
                      <dd className="font-mono text-xs break-all">
                        {config.reference}
                      </dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Opción A: Widget (botón que abre el pago en un modal de Wompi) */}
                    <WompiWidgetButton config={config} />

                    {/* Opción B: Checkout Web (redirección por URL, en la misma pestaña) */}
                    <Button asChild variant="outline">
                      <a href={buildWompiCheckoutUrl(config)}>
                        <ExternalLink />
                        Ir al Checkout Web
                      </a>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Al terminar, Wompi vuelve a la app y se confirma el pago.
                      Esta referencia es de un solo uso en pantalla: si recarga o
                      quiere reintentar, prepare el pago de nuevo.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handlePrepare}
                      disabled={checkoutConfigMutation.isPending}
                    >
                      {checkoutConfigMutation.isPending ? (
                        <Spinner />
                      ) : (
                        <RefreshCw />
                      )}
                      Nueva referencia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default AppointmentCheckoutPage;

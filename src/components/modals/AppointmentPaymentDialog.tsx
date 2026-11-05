import InlineNotice from "@/components/custom/InlineNotice";
import PaymentPricingSummary from "@/components/custom/PaymentPricingSummary";
import PaymentStatusPanel from "@/components/custom/PaymentStatusPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { canGeneratePaymentLink } from "@/config/appointmentStates";
import { isPaymentPaid } from "@/config/paymentStates";
import {
  useAppointmentPricing,
  useCreatePaymentLink,
  usePaymentPolling,
} from "@/hooks/usePayments";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import { formatHour } from "@/utils/dates";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CreditCard, Link2 } from "lucide-react";
import { useId, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AppointmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Cita (con paciente asignado) que se va a cobrar
  appointment: Appointment;
}

type PaymentFormProps = Omit<AppointmentPaymentDialogProps, "open">;

// El estado vive en este componente interno: Radix desmonta el contenido del diálogo al
// cerrarse, así el interruptor de correo y la ventana de polling se reinician solos y las
// consultas solo corren mientras el diálogo está abierto.
const PaymentForm = ({ onOpenChange, appointment }: PaymentFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailSwitchId = useId();
  const [sendEmail, setSendEmail] = useState(false);

  const pricingQuery = useAppointmentPricing(appointment.id);
  const { query: paymentQuery, payment, isPolling, timedOut, startPolling } =
    usePaymentPolling(appointment.id);
  const createLinkMutation = useCreatePaymentLink();

  const pricing = pricingQuery.data?.items;
  const isPaid = isPaymentPaid(payment) || pricing?.paymentStatus === "PAID";
  // priceUsd null: la cita no tiene precio y el backend respondería 400 al generar el enlace
  const noPrice = !!pricing && pricing.priceUsd == null;
  const canGenerate = canGeneratePaymentLink(appointment);

  const patientEmail = appointment.patient?.email;
  const patientName = appointment.patient
    ? `${appointment.patient.name} ${appointment.patient.lastname}`
    : "-";

  // Reconsulta el estado y reabre la ventana de polling (botón "Actualizar")
  const handleRefresh = () => {
    startPolling();
    paymentQuery.refetch();
  };

  const handleGenerateLink = async () => {
    // Sin correo registrado no se puede pedir el envío
    const shouldSendEmail = sendEmail && !!patientEmail;

    try {
      const response = await createLinkMutation.mutateAsync({
        appointmentId: appointment.id,
        sendEmail: shouldSendEmail,
      });

      toast.success(response?.message || "Enlace de pago generado");
      if (shouldSendEmail && response?.items && !response.items.emailSent) {
        toast.warning("No se pudo enviar el correo al paciente", {
          description: "Comparta el enlace manualmente.",
        });
      }

      // El paciente va a pagar: la confirmación llega por webhook, así que se consulta
      // el estado hasta que se resuelva
      startPolling();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo generar el enlace de pago",
      );
    }
  };

  // El Widget de Wompi no funciona dentro de un diálogo modal (el bloqueo de foco y de
  // clics de Radix choca con el overlay del widget), por eso vive en su propia pantalla.
  // Se manda la ruta actual para que esa pantalla pueda volver exactamente aquí.
  const handleOpenEmbeddedCheckout = () => {
    onOpenChange(false);
    navigate(`/schedules/${appointment.id}/checkout`, {
      state: { from: location.pathname },
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Pago de la cita</DialogTitle>
        <DialogDescription>
          Genere el enlace de pago de Wompi y compártalo con el paciente, o
          consulte cómo va el pago.
        </DialogDescription>
      </DialogHeader>

      {/* Cita */}
      <div className="p-4 bg-muted rounded-md space-y-2">
        <h4 className="font-semibold text-sm">Cita</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Fecha:</span>{" "}
            {format(parseISO(appointment.dateAppointment), "d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
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
          <div className="col-span-2">
            <span className="text-muted-foreground">Paciente:</span>{" "}
            {patientName}
            {patientEmail && (
              <span className="text-muted-foreground"> · {patientEmail}</span>
            )}
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

      {/* Cobrar: una cita ya pagada no se vuelve a cobrar */}
      {!isPaid && (
        <div className="rounded-md border p-4 space-y-3">
          <h4 className="font-semibold text-sm">Cobrar la cita</h4>

          {!canGenerate ? (
            <InlineNotice variant="warning" title="La cita está cancelada">
              No se genera un enlace de cobro para una cita cancelada.
            </InlineNotice>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 rounded-md border p-3">
                <div className="space-y-1">
                  <Label htmlFor={emailSwitchId}>
                    Enviar el enlace por correo al paciente
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {patientEmail
                      ? `Se enviará a ${patientEmail}. Sin esto solo se genera el enlace para que lo comparta usted.`
                      : "El paciente no tiene un correo registrado."}
                  </p>
                </div>
                <Switch
                  id={emailSwitchId}
                  checked={sendEmail && !!patientEmail}
                  onCheckedChange={setSendEmail}
                  disabled={!patientEmail || createLinkMutation.isPending}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateLink}
                  disabled={
                    noPrice ||
                    pricingQuery.isLoading ||
                    createLinkMutation.isPending
                  }
                >
                  {createLinkMutation.isPending ? <Spinner /> : <Link2 />}
                  {payment?.paymentLinkId
                    ? "Generar nuevo enlace"
                    : "Generar enlace de pago"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleOpenEmbeddedCheckout}
                  disabled={noPrice || pricingQuery.isLoading}
                >
                  <CreditCard />
                  Pagar en la app (Wompi)
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      </DialogFooter>
    </>
  );
};

// Diálogo de pago de una cita (flujo de enlaces de Wompi): muestra el valor en USD y su
// conversión a COP, genera el enlace (con envío opcional por correo), permite copiarlo o
// compartirlo y sigue el estado del pago hasta que el webhook lo confirme.
const AppointmentPaymentDialog = ({
  open,
  onOpenChange,
  appointment,
}: AppointmentPaymentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <PaymentForm onOpenChange={onOpenChange} appointment={appointment} />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentPaymentDialog;

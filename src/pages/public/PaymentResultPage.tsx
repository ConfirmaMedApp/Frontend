import InlineNotice from "@/components/custom/InlineNotice";
import { PaymentStatusBadge } from "@/components/custom/PaymentStatusBadge";
import VitaLogo from "@/components/custom/VitaLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  TRANSACTION_STATUSES,
  isPaymentFailed,
  isPaymentPaid,
} from "@/config/paymentStates";
import useAuth from "@/hooks/useAuth";
import { usePaymentPolling } from "@/hooks/usePayments";
import { formatCop, formatUsd } from "@/utils/currency";
import {
  clearPendingPayment,
  readPendingPayment,
  type PendingPayment,
} from "@/utils/wompi";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

interface ResultLayoutProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}

// Marco común de la página de resultado: sin sidebar ni navbar, porque quien llega aquí
// suele ser un paciente que acaba de pagar y no tiene sesión.
const ResultLayout = ({
  icon,
  title,
  description,
  children,
}: ResultLayoutProps) => (
  <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-background via-background to-primary/10">
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-6 p-4">
      <VitaLogo variant="full" className="w-48 bg-brand-ice rounded-lg" />
      <Card className="w-full p-6 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-muted">
          {icon}
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </Card>
    </div>
  </div>
);

interface StaffResultProps {
  pending: PendingPayment;
}

// Quien inició el cobro desde la app (con sesión): se consulta GET .../payment de ESA cita
// hasta que se confirme el pago o falle, porque la confirmación llega por webhook.
const StaffResult = ({ pending }: StaffResultProps) => {
  const navigate = useNavigate();

  const { query, payment, isPolling, timedOut, startPolling } =
    usePaymentPolling(pending.appointmentId, { autoStart: false });

  // Se acaba de volver de Wompi: el webhook puede tardar unos segundos en llegar
  useEffect(() => {
    startPolling();
  }, [startPolling]);

  const paid = isPaymentPaid(payment);
  const failed = isPaymentFailed(payment);

  // Con el pago resuelto ya no hace falta recordar la cita
  useEffect(() => {
    if (paid || failed) clearPendingPayment();
  }, [paid, failed]);

  const handleBack = () => {
    clearPendingPayment();
    navigate(pending.returnTo || "/home", { replace: true });
  };

  const handleRetry = () => {
    clearPendingPayment();
    navigate(`/schedules/${pending.appointmentId}/checkout`, {
      state: { from: pending.returnTo },
      replace: true,
    });
  };

  const handleVerifyAgain = () => {
    startPolling();
    query.refetch();
  };

  const transactionDescription =
    failed && payment?.transactionStatus
      ? TRANSACTION_STATUSES[payment.transactionStatus]?.description
      : undefined;

  const summary = payment && (
    <div className="space-y-2 rounded-md border p-3 text-left text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">Cita #{pending.appointmentId}</span>
        <PaymentStatusBadge status={payment.paymentStatus} size="sm" />
      </div>
      {payment.amountUsd != null && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Valor</span>
          <span className="font-medium">
            {formatUsd(payment.amountUsd)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}
              · {formatCop(payment.amountCop)} {payment.currency}
            </span>
          </span>
        </div>
      )}
    </div>
  );

  if (paid) {
    return (
      <ResultLayout
        icon={<CircleCheck className="size-8 text-success" />}
        title="¡Pago confirmado!"
        description="El pago fue aprobado y la cita quedó registrada como pagada."
      >
        {summary}
        <Button className="w-full" onClick={handleBack}>
          Volver
        </Button>
      </ResultLayout>
    );
  }

  if (failed) {
    return (
      <ResultLayout
        icon={<CircleX className="size-8 text-destructive" />}
        title="El pago no fue aprobado"
        description={`${transactionDescription ?? ""} Puede intentarlo de nuevo.`.trim()}
      >
        {summary}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            Volver
          </Button>
          <Button className="flex-1" onClick={handleRetry}>
            Intentar de nuevo
          </Button>
        </div>
      </ResultLayout>
    );
  }

  if (timedOut) {
    return (
      <ResultLayout
        icon={<Clock className="size-8 text-amber-500" />}
        title="Aún no recibimos la confirmación"
        description="Si el pago se realizó, puede tardar un poco más en reflejarse. Puede verificar de nuevo o volver más tarde."
      >
        {summary}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="flex-1" onClick={handleBack}>
            Volver
          </Button>
          <Button className="flex-1" onClick={handleVerifyAgain}>
            Verificar de nuevo
          </Button>
        </div>
      </ResultLayout>
    );
  }

  // Esperando el webhook (o todavía consultando por primera vez)
  return (
    <ResultLayout
      icon={<Spinner className="size-8 text-primary" />}
      title="Confirmando tu pago…"
      description="Estamos esperando la confirmación de Wompi. Suele tardar solo unos segundos."
    >
      {query.isError && !payment && (
        <InlineNotice
          variant="warning"
          title="No pudimos consultar el estado todavía"
          className="text-left"
        >
          {query.error instanceof Error ? query.error.message : "Reintentando…"}
        </InlineNotice>
      )}
      {summary}
      {isPolling && (
        <Button variant="ghost" className="w-full" onClick={handleBack}>
          Volver sin esperar
        </Button>
      )}
    </ResultLayout>
  );
};

// Página a la que Wompi redirige tras el pago (`Wompi:RedirectUrl` del backend, p. ej.
// /pago/resultado). Es pública: el paciente llega sin sesión. Wompi agrega a la URL el id de la
// transacción (?id=...).
//   - Con sesión y una cita en curso (se inició el cobro desde la app en esta pestaña): se
//     consulta el estado real del pago hasta que se resuelva.
//   - Sin sesión (paciente que pagó desde el enlace): el estado exige JWT, así que solo se
//     le confirma que se recibió el pago. La confirmación llega al backend por webhook.
const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("id");

  const { checkToken } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  // Se lee una sola vez: StaffResult puede limpiarlo cuando el pago se resuelve
  const [pending] = useState(() => readPendingPayment());

  useEffect(() => {
    let isMounted = true;
    checkToken().then((authenticated) => {
      if (isMounted) setIsAuthenticated(authenticated);
    });
    return () => {
      isMounted = false;
    };
  }, [checkToken]);

  if (isAuthenticated === null) {
    return (
      <div className="h-full w-full grid place-items-center">
        <Spinner className="size-12" />
      </div>
    );
  }

  if (isAuthenticated && pending) {
    return <StaffResult pending={pending} />;
  }

  return (
    <ResultLayout
      icon={<Clock className="size-8 text-primary" />}
      title="Recibimos el resultado de tu pago"
      description="Wompi le informará a la clínica el resultado en unos segundos y tu cita se marcará como pagada apenas se confirme. Puedes cerrar esta página. Si tu banco rechazó la transacción, vuelve a abrir el enlace de pago e inténtalo de nuevo."
    >
      {transactionId && (
        <div className="rounded-md border p-3 text-left text-sm">
          <p className="text-xs text-muted-foreground">
            Referencia de la transacción
          </p>
          <p className="font-mono text-xs break-all">{transactionId}</p>
        </div>
      )}
      {isAuthenticated && (
        <Button asChild variant="outline" className="w-full">
          <Link to="/home">Ir al inicio</Link>
        </Button>
      )}
    </ResultLayout>
  );
};

export default PaymentResultPage;

import type { CheckoutConfig } from "@/interfaces/paymentsInterface";

// Script del Widget de Wompi. Lee los atributos `data-*` de su propia etiqueta <script>
// y agrega su botón dentro del <form> que la contiene.
export const WOMPI_WIDGET_SRC = "https://checkout.wompi.co/widget.js";

const WOMPI_WEB_CHECKOUT_URL = "https://checkout.wompi.co/p/";

// Checkout Web (redirección por URL). Todos los valores salen tal cual de checkout-config:
// el frontend no calcula ni modifica `amount-in-cents`, `reference` ni `signature:integrity`
// (si cambia cualquiera, Wompi rechaza la transacción por firma inválida). Los valores solo
// se codifican para que viajen bien dentro de la URL; los nombres de parámetro van como
// los documenta Wompi.
export const buildWompiCheckoutUrl = (config: CheckoutConfig) => {
  const params: [string, string][] = [
    ["public-key", config.publicKey],
    ["currency", config.currency],
    ["amount-in-cents", String(config.amountInCents)],
    ["reference", config.reference],
    ["signature:integrity", config.signatureIntegrity],
  ];

  // Un redirect-url vacío haría que Wompi lo rechace por inválido, así que se omite
  if (config.redirectUrl) {
    params.push(["redirect-url", config.redirectUrl]);
  }

  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${WOMPI_WEB_CHECKOUT_URL}?${query}`;
};

// ---- Pago en curso (sessionStorage) ----
//
// Al pagar con el Widget o el Checkout Web, Wompi redirige al paciente a la página de
// resultado del frontend (`Wompi:RedirectUrl`), recargando la app. Para que quien inició
// el cobro vea el desenlace de ESA cita, se guarda aquí qué cita se estaba pagando.
// Va en sessionStorage (por pestaña): sobrevive al viaje a Wompi y de vuelta, y no se
// mezcla con otras pestañas.

const PENDING_PAYMENT_KEY = "wompi:pending-payment";

// Pasado este tiempo el contexto se considera viejo y se ignora
const PENDING_PAYMENT_MAX_AGE = 6 * 60 * 60 * 1000;

export interface PendingPayment {
  appointmentId: number;
  reference: string;
  returnTo: string; // Ruta a la que se vuelve al terminar
  startedAt: number;
}

export const savePendingPayment = (payment: PendingPayment) => {
  try {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
  } catch {
    // Sin sessionStorage (modo privado o bloqueado) el flujo sigue: solo se pierde el seguimiento
  }
};

export const readPendingPayment = (): PendingPayment | null => {
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    if (!raw) return null;

    const payment = JSON.parse(raw) as Partial<PendingPayment>;
    const isValid =
      typeof payment.appointmentId === "number" &&
      payment.appointmentId > 0 &&
      typeof payment.startedAt === "number" &&
      Date.now() - payment.startedAt < PENDING_PAYMENT_MAX_AGE;

    return isValid ? (payment as PendingPayment) : null;
  } catch {
    return null;
  }
};

export const clearPendingPayment = () => {
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  } catch {
    // Nada que limpiar
  }
};

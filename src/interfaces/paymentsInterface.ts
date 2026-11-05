// ---- Estados ----

// Estado de pago de la cita
export type PaymentStatus = "UNPAID" | "PAID";

// Estado de la transacción en Wompi
export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

// ---- Precios (doctor + especialidad) ----

// Precio en USD de una combinación doctor + especialidad
export interface DoctorSpecialityPrice {
  id: number;
  doctorId: number;
  specialityId: number;
  priceUsd: number | null; // null mientras no se le haya puesto precio a la combinación
  status: boolean;
}

// Body para fijar o actualizar el precio de una combinación que ya existe
export interface SetDoctorSpecialityPriceRequest {
  doctorId: number;
  specialityId: number;
  priceUsd: number;
}

// Filtros opcionales y combinables del listado de precios (sin filtros devuelve todo)
export interface DoctorSpecialityPriceFilters {
  doctorId?: number | null;
  specialityId?: number | null;
}

// ---- Cobro de la cita ----

// Valores de la cita antes de generar el enlace: precio en USD y su conversión a COP
// con la TRM vigente. El frontend no convierte nada, solo muestra lo que devuelve el backend.
export interface AppointmentPricing {
  appointmentId: number;
  priceUsd: number | null; // null si la cita no tiene precio (y trm/priceCop vienen en 0)
  trm: number;
  priceCop: number;
  currency: string;
  paymentStatus: PaymentStatus;
}

// Body para generar el enlace de pago. Sin body equivale a `sendEmail: false`
export interface PaymentLinkRequest {
  sendEmail?: boolean;
}

// Enlace de pago de Wompi generado para la cita
export interface PaymentLink {
  appointmentId: number;
  paymentLinkId: string;
  checkoutUrl: string; // La URL que abre/comparte el paciente
  amountUsd: number;
  trm: number; // Tasa USD→COP aplicada
  amountCop: number; // Pesos enteros, sin decimales
  amountInCents: number; // amountCop × 100 (lo que recibe Wompi)
  currency: string;
  expiresAt: string; // Vencimiento del enlace (UTC)
  emailSent: boolean; // true solo si se pidió `sendEmail` y el correo salió
}

// Estado de pago de la cita + el último enlace/transacción generado. Salvo `appointmentId`
// y `paymentStatus`, los campos vienen null mientras no exista enlace (o pago).
export interface AppointmentPayment {
  appointmentId: number;
  paymentStatus: PaymentStatus; // Estado de la cita
  paymentLinkId: string | null;
  checkoutUrl: string | null;
  transactionStatus: TransactionStatus | null; // Estado de la transacción en Wompi
  amountUsd: number | null;
  amountCop: number | null;
  currency: string | null;
  expiresAt: string | null;
  paidAt: string | null;
}

// Configuración ya firmada para el Widget / Checkout Web embebido. El frontend no recalcula
// ni modifica `amountInCents`, `reference` ni `signatureIntegrity`: si alguno cambia, Wompi
// rechaza la transacción por firma inválida.
export interface CheckoutConfig {
  appointmentId: number;
  publicKey: string; // Llave pública (pub_...), segura de exponer en el cliente
  currency: string; // Siempre COP
  amountInCents: number;
  reference: string; // Única por llamada
  signatureIntegrity: string;
  redirectUrl: string; // A dónde vuelve el paciente tras pagar
  amountUsd: number; // Solo para mostrar en la UI
  trm: number; // Solo para mostrar en la UI
  amountCop: number; // Solo para mostrar en la UI
}

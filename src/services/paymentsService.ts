import axiosService from "@/config/axiosService";
import type { ApiResponse } from "@/interfaces/appointmentsInterface";
import type {
  AppointmentPayment,
  AppointmentPricing,
  CheckoutConfig,
  DoctorSpecialityPrice,
  DoctorSpecialityPriceFilters,
  PaymentLink,
  PaymentLinkRequest,
  SetDoctorSpecialityPriceRequest,
} from "@/interfaces/paymentsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// Los endpoints de cobro cuelgan de la cita: /appointments/{id}/...
const APPOINTMENTS_URL = "/Appointments";

// El precio (USD) vive en la relación doctor + especialidad
const PRICES_URL = "/DoctorsHasSpecialities";

// Generar el enlace o la configuración del checkout puede tardar: el backend consulta la TRM,
// llama a Wompi y, si se pide, envía el correo. El timeout global (10 s) se queda corto.
const SLOW_REQUEST_TIMEOUT = 30_000;

// Fija o actualiza el precio (USD) de una combinación doctor + especialidad existente.
// 400 si el precio es negativo o si el doctor no tiene asignada esa especialidad.
const setDoctorSpecialityPrice = async (
  data: SetDoctorSpecialityPriceRequest,
) => {
  try {
    const response = await axiosService.put<ApiResponse<DoctorSpecialityPrice>>(
      `${PRICES_URL}/price`,
      data,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al actualizar el precio");
  }
};

// Lista los precios. Ambos filtros son opcionales y combinables; axios omite los params
// null, así que solo viajan los que tienen valor.
const getDoctorSpecialityPrices = async ({
  doctorId = null,
  specialityId = null,
}: DoctorSpecialityPriceFilters = {}) => {
  try {
    const response = await axiosService.get<ApiResponse<DoctorSpecialityPrice[]>>(
      `${PRICES_URL}/prices`,
      { params: { doctorId, specialityId } },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener los precios");
  }
};

// Precio en USD de la cita y su conversión a COP con la TRM vigente (antes de generar el enlace)
const getAppointmentPricing = async (appointmentId: number) => {
  try {
    const response = await axiosService.get<ApiResponse<AppointmentPricing>>(
      `${APPOINTMENTS_URL}/${appointmentId}/pricing`,
      { timeout: SLOW_REQUEST_TIMEOUT },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al obtener el valor de la cita");
  }
};

// Crea (o regenera) el enlace de pago de Wompi. Con `sendEmail` además lo envía por correo al
// paciente de la cita; sin él solo devuelve la URL para compartirla por otro medio.
const createPaymentLink = async (
  appointmentId: number,
  sendEmail: boolean = false,
) => {
  try {
    const body: PaymentLinkRequest = { sendEmail };
    const response = await axiosService.post<ApiResponse<PaymentLink>>(
      `${APPOINTMENTS_URL}/${appointmentId}/payment-link`,
      body,
      { timeout: SLOW_REQUEST_TIMEOUT },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al generar el enlace de pago");
  }
};

// Estado de pago de la cita + el último enlace/transacción generado
const getAppointmentPayment = async (appointmentId: number) => {
  try {
    const response = await axiosService.get<ApiResponse<AppointmentPayment>>(
      `${APPOINTMENTS_URL}/${appointmentId}/payment`,
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al consultar el estado del pago");
  }
};

// Configuración firmada para el Widget / Checkout Web embebido. Genera una referencia única
// por llamada: si se recarga la pantalla hay que pedir una nueva.
const createCheckoutConfig = async (appointmentId: number) => {
  try {
    const response = await axiosService.post<ApiResponse<CheckoutConfig>>(
      `${APPOINTMENTS_URL}/${appointmentId}/checkout-config`,
      undefined,
      { timeout: SLOW_REQUEST_TIMEOUT },
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al generar la configuración del checkout");
  }
};

// Exportar el servicio de pagos
export const paymentsService = {
  setDoctorSpecialityPrice,
  getDoctorSpecialityPrices,
  getAppointmentPricing,
  createPaymentLink,
  getAppointmentPayment,
  createCheckoutConfig,
};

import type { CheckoutConfig } from "@/interfaces/paymentsInterface";
import { WOMPI_WIDGET_SRC } from "@/utils/wompi";
import { useEffect, useRef } from "react";

interface WompiWidgetButtonProps {
  config: CheckoutConfig;
  className?: string;
}

// Botón del Widget de Wompi (abre el pago en un modal) con los valores ya firmados de
// checkout-config. Reproduce tal cual el HTML de la guía:
//
//   <form>
//     <script src="https://checkout.wompi.co/widget.js" data-render="button"
//       data-public-key=... data-currency=... data-amount-in-cents=... data-reference=...
//       data-signature:integrity=... data-redirect-url=...></script>
//   </form>
//
// El widget lee los `data-*` de su propia etiqueta <script> y agrega su botón al <form>
// que la contiene, por eso el script se crea y se inserta dentro del formulario.
// Los valores se pasan sin tocar: si cambian `amountInCents`, `reference` o
// `signatureIntegrity`, Wompi rechaza la transacción por firma inválida.
const WompiWidgetButton = ({ config, className }: WompiWidgetButtonProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // El script se inserta en el siguiente tick. En desarrollo StrictMode monta, desmonta y
    // vuelve a montar el efecto: un <script> quitado del DOM antes de ejecutarse corre igual,
    // pero ya sin su <form> padre, y el widget lo reporta como error en la consola.
    const timer = window.setTimeout(() => {
      const script = document.createElement("script");
      script.src = WOMPI_WIDGET_SRC;
      script.setAttribute("data-render", "button");
      script.setAttribute("data-public-key", config.publicKey);
      script.setAttribute("data-currency", config.currency);
      script.setAttribute("data-amount-in-cents", String(config.amountInCents));
      script.setAttribute("data-reference", config.reference);
      script.setAttribute("data-signature:integrity", config.signatureIntegrity);
      // Un redirect-url vacío haría que el widget lo rechace por inválido
      if (config.redirectUrl) {
        script.setAttribute("data-redirect-url", config.redirectUrl);
      }
      form.appendChild(script);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      // Quita el script y el botón que el widget agregó al formulario
      form.replaceChildren();
    };
  }, [config]);

  return <form ref={formRef} className={className} aria-label="Pago con Wompi" />;
};

export default WompiWidgetButton;

// El precio se define y se muestra en USD, pero Wompi solo cobra en COP. El backend hace la
// conversión con la TRM del día; aquí solo se da formato a lo que devuelve.
const NO_VALUE = "—";

const usdFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "USD",
});

// Los montos en pesos van sin decimales (pesos enteros)
const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const trmFormatter = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// "200" -> "US$ 200,00"
export const formatUsd = (value: number | null | undefined) =>
  value == null ? NO_VALUE : usdFormatter.format(value);

// "820100" -> "$ 820.100"
export const formatCop = (value: number | null | undefined) =>
  value == null ? NO_VALUE : copFormatter.format(value);

// "4100.5" -> "4.100,50". El backend manda trm = 0 cuando la cita no tiene precio
export const formatTrm = (value: number | null | undefined) =>
  value == null || value === 0 ? NO_VALUE : trmFormatter.format(value);

// Las marcas de tiempo de auditoría del backend (p. ej. `createdAt` del historial)
// llegan sin zona horaria pero están en UTC. Sin la "Z", `new Date()` las tomaría
// como hora local y se verían desfasadas. Si ya traen zona (Z u offset) se respetan.
const HAS_TIMEZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

export const parseServerDate = (value: string) =>
  new Date(HAS_TIMEZONE.test(value) ? value : `${value}Z`);

// "09:00:00" -> "09:00"
export const formatHour = (hour: string) => hour.slice(0, 5);

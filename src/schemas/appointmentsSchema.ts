import { z } from "zod";

// Esquema de validación para la creación de agendas médicas
export const appointmentCreateSchema = z.object({
  specialityId: z
    .number({
      message: "La especialidad es obligatoria",
    })
    .int("La especialidad no es válida")
    .positive("La especialidad no es válida"),
  doctorId: z
    .number({
      message: "El doctor es obligatorio",
    })
    .int("El doctor no es válido")
    .positive("El doctor no es válido"),
  dates: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una fecha")
    .refine((dates) => dates.every((date) => !isNaN(Date.parse(date))), {
      message: "Una o más fechas no son válidas",
    }),
  startHour: z
    .string()
    .min(1, "La hora de inicio es obligatoria")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
  endHour: z
    .string()
    .min(1, "La hora de fin es obligatoria")
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)"),
  durationId: z
    .number({
      message: "La duración de la consulta es obligatoria",
    })
    .int("La duración no es válida")
    .positive("La duración no es válida"),
}).refine((data) => data.startHour < data.endHour, {
  message: "La hora de fin debe ser posterior a la hora de inicio",
  path: ["endHour"],
});

export type AppointmentCreateFormValues = z.infer<typeof appointmentCreateSchema>;

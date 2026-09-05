import { z } from "zod";

// Esquema de validación para la creación de un doctor
export const doctorCreateSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z
    .string()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  document: z
    .string()
    .min(1, "El número de documento es obligatorio")
    .min(5, "El documento debe tener al menos 5 caracteres"),
  documentTypeId: z
    .number({
      message: "El tipo de documento es obligatorio",
    })
    .int("El tipo de documento no es válido")
    .positive("El tipo de documento no es válido"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("El correo electrónico no es válido"),
  status: z.boolean({
    message: "El estado es obligatorio",
  }),
});

// Esquema de validación para la actualización de un doctor
export const doctorUpdateSchema = doctorCreateSchema.extend({
  id: z
    .number({
      message: "El identificador del doctor es obligatorio",
    })
    .int("El identificador del doctor no es válido")
    .positive("El identificador del doctor no es válido"),
});

export type DoctorUpdateFormValues = z.infer<typeof doctorUpdateSchema>;

export type DoctorCreateFormValues = z.infer<typeof doctorCreateSchema>;

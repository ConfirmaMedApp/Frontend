import { z } from "zod";

// Esquema de validaciones para crear un paciente
export const patientCreateSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  lastname: z
    .string()
    .min(1, "El apellido es obligatorio")
    .min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("El correo electrónico no es válido"),
  phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .min(7, "El teléfono debe tener al menos 7 dígitos")
    .max(15, "El teléfono no puede tener más de 15 dígitos")
    .regex(/^\+?[0-9\s-]+$/, "El teléfono no es válido"),
  birthdate: z
    .string()
    .min(1, "La fecha de nacimiento es obligatoria")
    .refine(
      (value) => !isNaN(Date.parse(value)),
      "La fecha de nacimiento no es válida"
    ),
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
  genderId: z
    .number({
      message: "El género es obligatorio",
    })
    .int("El género no es válido")
    .positive("El género no es válido"),
});

// Esquema de validacion para actualizar un paciente
export const patientUpdateSchema = patientCreateSchema.extend({
  id: z
    .number({
      message: "El identificador del paciente es obligatorio",
    })
    .int("El identificador del paciente no es válido")
    .positive("El identificador del paciente no es válido"),
});

// Exportar tipos de formularios basados en los esquemas
export type PatientCreateFormValues = z.infer<typeof patientCreateSchema>;
export type PatientUpdateFormValues = z.infer<typeof patientUpdateSchema>;

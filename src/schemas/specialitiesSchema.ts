import { z } from "zod";

// Esquema de validacion para crear una especialidad
export const specialityCreateSchema = z.object({
  name: z
    .string({
      message: "El nombre es obligatorio",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  description: z
    .string({
      message: "La descripción debe ser un texto",
    })
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional(),
  code: z
    .string({
      message: "El código es obligatorio",
    })
    .min(1, "El código debe tener al menos 1 caracteres")
    .max(5, "El código no puede superar los 5 caracteres"),
  status: z.boolean({
    message: "El estado es obligatorio",
  }),
});

// Esquema de validacion para actualizar una especialidad
export const specialityUpdateSchema = z.object({
  id: z.number({
    message: "El ID de la especialidad es obligatorio",
  }),
  name: z
    .string({
      message: "El nombre debe ser un texto",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres")
    .optional(),
  description: z
    .string({
      message: "La descripción debe ser un texto",
    })
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional(),
  code: z
    .string({
      message: "El código debe ser un texto",
    })
    .min(1, "El código debe tener al menos 1 caracteres")
    .max(5, "El código no puede superar los 5 caracteres")
    .optional(),
  status: z
    .boolean({
      message: "El estado debe ser verdadero o falso",
    })
    .optional(),
});

// Tipos inferidos de los esquemas
export type SpecialityUpdateSchema = z.infer<typeof specialityUpdateSchema>;
export type SpecialityCreateSchema = z.infer<typeof specialityCreateSchema>;

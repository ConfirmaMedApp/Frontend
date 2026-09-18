import { z } from "zod";

// Roles disponibles para los usuarios
export const userRoles = ["admin", "secretaria", "doctor"] as const;

// Esquema de validaciones para crear un usuario
export const userCreateSchema = z.object({
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
  username: z
    .string()
    .min(1, "El nombre de usuario es obligatorio")
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  doctorId: z
    .number({
      message: "El doctor es obligatorio",
    })
    .int("El doctor no es válido")
    .positive("El doctor no es válido"),
  status: z.boolean({
    message: "El estado es obligatorio",
  }),
  role: z.enum(userRoles, {
    message: "El rol es obligatorio",
  }),
});

// Esquema de validacion para actualizar un usuario
export const userUpdateSchema = z.object({
  id: z
    .number({
      message: "El identificador del usuario no es válido",
    })
    .int("El identificador del usuario no es válido")
    .positive("El identificador del usuario no es válido"),
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  lastname: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().email("El correo electrónico no es válido").optional(),
  username: z
    .string()
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres")
    .optional(),
  doctorId: z
    .number({
      message: "El doctor no es válido",
    })
    .int("El doctor no es válido")
    .positive("El doctor no es válido")
    .optional(),
  status: z
    .boolean({
      message: "El estado debe ser verdadero o falso",
    })
    .optional(),
  role: z
    .enum(userRoles, {
      message: "El rol no es válido",
    })
    .optional(),
});

// Exportar tipos de formularios basados en los esquemas
export type UserUpdateFormValues = z.infer<typeof userUpdateSchema>;
export type UserCreateFormValues = z.infer<typeof userCreateSchema>;

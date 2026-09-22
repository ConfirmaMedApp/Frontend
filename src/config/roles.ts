import { userRoles } from "@/schemas/usersSchema";

export type UserRole = (typeof userRoles)[number];

export const ADMIN_ROLE: UserRole = "admin";
export const DOCTOR_ROLE: UserRole = "doctor";
export const SECRETARY_ROLE: UserRole = "secretaria";

// Determina si un rol tiene acceso a un recurso restringido a `allowedRoles`.
// El rol admin siempre tiene acceso, sin importar la lista recibida.
export const hasRoleAccess = (
  allowedRoles: string[] | undefined,
  userRole: string | null | undefined
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (userRole === ADMIN_ROLE) return true;
  return !!userRole && allowedRoles.includes(userRole);
};

// Ruta a la que se redirige a un usuario autenticado que intenta acceder
// a una sección para la que su rol no tiene permisos.
export const getDefaultRouteForRole = (
  userRole: string | null | undefined
): string => {
  if (userRole === DOCTOR_ROLE) return "/schedules/mine";
  if (userRole === SECRETARY_ROLE) return "/schedules/create";
  return "/specialities";
};

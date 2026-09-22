import {
  Brain,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CalendarRange,
  Stethoscope,
  UserCheck,
  Users,
  UserStar,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_ROLE, DOCTOR_ROLE, SECRETARY_ROLE } from "./roles";

interface MenuItem {
  titleKey?: string;
  title: string;
  icon: LucideIcon;
  childrens?: MenuItem[];
  to?: string;
  url?: string;
  // Roles permitidos para ver este ítem. Si se omite, es visible para todos.
  roles?: string[];
}

export const menuItems: MenuItem[] = [
  {
    title: "Especialidades",
    titleKey: "menu.specialities",
    icon: Brain,
    to: "/specialities",
    roles: [ADMIN_ROLE, SECRETARY_ROLE],
  },
  {
    title: "Doctores",
    titleKey: "menu.doctors",
    icon: Stethoscope,
    to: "/doctors",
    roles: [ADMIN_ROLE, SECRETARY_ROLE],
  },
  {
    title: "Usuarios",
    titleKey: "menu.users",
    icon: Users,
    to: "/users",
    roles: [ADMIN_ROLE],
  },
  {
    title: "Pacientes",
    titleKey: "menu.patients",
    icon: UserStar,
    to: "/patients",
    roles: [ADMIN_ROLE, SECRETARY_ROLE],
  },
  {
    title: "Pacientes atendidos",
    titleKey: "menu.attendedPatients",
    icon: UserCheck,
    to: "/patients/attended",
    roles: [ADMIN_ROLE, DOCTOR_ROLE],
  },
  {
    title: "Agendas",
    titleKey: "menu.schedules",
    icon: CalendarRange,
    to: "/schedules",
    roles: [ADMIN_ROLE, SECRETARY_ROLE],
    childrens: [
      {
        title: "Crear agenda",
        titleKey: "menu.createSchedule",
        icon: CalendarPlus,
        to: "/schedules/create",
        roles: [ADMIN_ROLE, SECRETARY_ROLE],
      },
      {
        title: "Agendas programadas",
        titleKey: "menu.scheduledSchedules",
        icon: CalendarClock,
        to: "/schedules",
        roles: [ADMIN_ROLE],
      },
    ],
  },
  {
    title: "Mis agendas",
    titleKey: "menu.mySchedules",
    icon: CalendarCheck,
    to: "/schedules/mine",
    roles: [ADMIN_ROLE, DOCTOR_ROLE],
  },
];

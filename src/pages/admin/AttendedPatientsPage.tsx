import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Container from "@/components/partials/Container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendedPatients } from "@/hooks/usePatients";
import { useAppointmentsByPatient } from "@/hooks/useAppointments";
import { useAppointmentNotes } from "@/hooks/useAppointmentsNotes";
import { useSpecialities } from "@/hooks/useSpecialities";
import type { Patient } from "@/interfaces/patientsInterface";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import type { AppointmentNote } from "@/interfaces/appointmentsNotesInterface";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import { cn } from "@/lib/utils";
import {
  Cake,
  CalendarDays,
  ChevronRight,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  Clock,
  Filter,
  IdCard,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Stethoscope,
  StickyNote,
  UserCheck,
  UserRound,
  Video,
  X,
} from "lucide-react";

type Step = "patients" | "appointments" | "notes";

const ITEMS_PER_PAGE = 8;

// Calcula la edad a partir de la fecha de nacimiento
const calculateAge = (birthdate: string) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const AttendedPatientsPage = () => {
  const [step, setStep] = useState<Step>("patients");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Filtros y paginación - nivel pacientes
  const [patientSearch, setPatientSearch] = useState("");
  const [patientStartDate, setPatientStartDate] = useState<Date | undefined>(
    undefined,
  );
  const [patientPage, setPatientPage] = useState(1);

  // Filtros y paginación - nivel citas del paciente
  const [specialityId, setSpecialityId] = useState<number | null>(null);
  const [appointmentStartDate, setAppointmentStartDate] = useState<
    Date | undefined
  >(undefined);
  const [appointmentPage, setAppointmentPage] = useState(1);

  // Nivel 1: pacientes atendidos por el doctor autenticado
  const {
    data: patientsData,
    isLoading: isLoadingPatients,
    isError: isErrorPatients,
    error: patientsError,
    refetch: refetchPatients,
  } = useAttendedPatients({
    startDate: patientStartDate ? format(patientStartDate, "yyyy-MM-dd") : null,
    search: patientSearch || null,
    limit: ITEMS_PER_PAGE,
    offset: (patientPage - 1) * ITEMS_PER_PAGE,
  });

  const attendedPatients: Patient[] = patientsData?.items || [];
  const canGoNextPatients = attendedPatients.length === ITEMS_PER_PAGE;

  // Nivel 2: citas del paciente seleccionado
  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    isError: isErrorAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useAppointmentsByPatient(selectedPatient?.id || 0, {
    specialityId,
    startDate: appointmentStartDate
      ? format(appointmentStartDate, "yyyy-MM-dd")
      : null,
    limit: ITEMS_PER_PAGE,
    offset: (appointmentPage - 1) * ITEMS_PER_PAGE,
  });

  const patientAppointments: Appointment[] = appointmentsData?.items || [];
  const canGoNextAppointments = patientAppointments.length === ITEMS_PER_PAGE;

  const { data: specialitiesData } = useSpecialities({
    limit: null,
    offset: null,
    search: null,
  });

  // Nivel 3: notas de la cita seleccionada
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    isError: isErrorNotes,
    error: notesError,
  } = useAppointmentNotes(selectedAppointment?.id || 0);

  const appointmentNotes: AppointmentNote[] = notesData?.items || [];

  // Navegación jerárquica (breadcrumb)
  const handleGoToPatients = () => {
    setStep("patients");
    setSelectedPatient(null);
    setSelectedAppointment(null);
  };

  const handleGoToAppointments = () => {
    setStep("appointments");
    setSelectedAppointment(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedAppointment(null);
    setSpecialityId(null);
    setAppointmentStartDate(undefined);
    setAppointmentPage(1);
    setStep("appointments");
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setStep("notes");
  };

  return (
    <Container
      titleModule="Pacientes atendidos"
      description="Consulta el historial de pacientes que has atendido"
      icon={<UserCheck size={30} />}
      showButtons={false}
    >
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <button
            onClick={handleGoToPatients}
            className={cn(
              "hover:underline",
              step === "patients"
                ? "font-semibold text-foreground"
                : "text-muted-foreground",
            )}
          >
            Pacientes atendidos
          </button>
          {selectedPatient && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <button
                onClick={handleGoToAppointments}
                className={cn(
                  "hover:underline",
                  step === "appointments"
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {selectedPatient.name} {selectedPatient.lastname}
              </button>
            </>
          )}
          {selectedAppointment && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground">
                Cita del{" "}
                {format(
                  new Date(`${selectedAppointment.dateAppointment}T00:00:00`),
                  "d MMM yyyy",
                  { locale: es },
                )}
              </span>
            </>
          )}
        </div>

        {/* Nivel 1: listado de pacientes atendidos */}
        {step === "patients" && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, apellido, documento o email..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setPatientPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <DatePicker
                    date={patientStartDate}
                    onDateChange={(date) => {
                      setPatientStartDate(date);
                      setPatientPage(1);
                    }}
                    placeholder="Fecha desde"
                    className="w-full sm:w-[170px]"
                  />
                  {patientStartDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPatientStartDate(undefined);
                        setPatientPage(1);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchPatients()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {isLoadingPatients ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <Skeleton key={index} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : isErrorPatients ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-destructive font-semibold">
                  {(patientsError as Error)?.message ||
                    "Ocurrió un error inesperado"}
                </p>
              </Card>
            ) : attendedPatients.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No se encontraron pacientes atendidos
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {attendedPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all p-4 gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="size-11 shrink-0">
                            <AvatarFallback>
                              {(patient.name?.charAt(0) || "") +
                                (patient.lastname?.charAt(0) || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight truncate">
                              {patient.name} {patient.lastname}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {patient.documentType?.name}: {patient.document}
                            </p>
                          </div>
                        </div>
                        {patient.status !== undefined && (
                          <Badge
                            variant={patient.status ? "success" : "destructive"}
                            className="shrink-0"
                          >
                            {patient.status ? "Activo" : "Inactivo"}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1.5 text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <Cake className="h-3.5 w-3.5 shrink-0" />
                          {patient.birthdate} ({calculateAge(patient.birthdate)}{" "}
                          años)
                        </div>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-3.5 w-3.5 shrink-0" />
                          {patient.gender?.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-end text-xs text-primary font-medium pt-1">
                        Ver citas <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-sm text-muted-foreground">
                    Página {patientPage}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                      disabled={patientPage === 1}
                    >
                      <ChevronsLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPatientPage((p) => p + 1)}
                      disabled={!canGoNextPatients}
                    >
                      <ChevronsRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Nivel 2: citas del paciente seleccionado */}
        {step === "appointments" && selectedPatient && (
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-64">
                  <Select
                    value={specialityId?.toString() || "all"}
                    onValueChange={(value) => {
                      setSpecialityId(value === "all" ? null : Number(value));
                      setAppointmentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Todas las especialidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Todas las especialidades
                      </SelectItem>
                      {specialitiesData?.items?.map((speciality: Speciality) => (
                        <SelectItem
                          key={speciality.id}
                          value={speciality.id.toString()}
                        >
                          {speciality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <DatePicker
                    date={appointmentStartDate}
                    onDateChange={(date) => {
                      setAppointmentStartDate(date);
                      setAppointmentPage(1);
                    }}
                    placeholder="Fecha desde"
                    className="w-full sm:w-[170px]"
                  />
                  {appointmentStartDate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setAppointmentStartDate(undefined);
                        setAppointmentPage(1);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refetchAppointments()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {isLoadingAppointments ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-52 w-full rounded-xl" />
                ))}
              </div>
            ) : isErrorAppointments ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-destructive font-semibold">
                  {(appointmentsError as Error)?.message ||
                    "Ocurrió un error inesperado"}
                </p>
              </Card>
            ) : patientAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Este paciente no tiene citas registradas
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patientAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      onClick={() => handleSelectAppointment(appointment)}
                      className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all p-4 gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                          <p className="font-semibold">
                            {appointment.dateAppointment}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Badge
                            variant={
                              appointment.isOccuped ? "destructive" : "success"
                            }
                          >
                            {appointment.isOccuped ? "Ocupada" : "Disponible"}
                          </Badge>
                          <Badge
                            variant={
                              appointment.isApproved ? "success" : "secondary"
                            }
                          >
                            {appointment.isApproved ? "Aprobada" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-2 col-span-2">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {appointment.startHour} - {appointment.endHour} (
                          {appointment.duration?.interval})
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                          {appointment.speciality?.name}
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                          <UserRound className="h-3.5 w-3.5 shrink-0" />
                          Dr(a). {appointment.doctor?.name}{" "}
                          {appointment.doctor?.lastName}
                        </div>
                        {appointment.roomName && (
                          <div className="flex items-center gap-2 col-span-2 truncate">
                            <Video className="h-3.5 w-3.5 shrink-0" />
                            {appointment.roomName}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-end text-xs text-primary font-medium pt-1">
                        Ver notas <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="text-sm text-muted-foreground">
                    Página {appointmentPage}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setAppointmentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={appointmentPage === 1}
                    >
                      <ChevronsLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setAppointmentPage((p) => p + 1)}
                      disabled={!canGoNextAppointments}
                    >
                      <ChevronsRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Nivel 3: notas de la cita seleccionada */}
        {step === "notes" && selectedAppointment && (
          <div className="space-y-4">
            <Card className="p-4 gap-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="font-semibold">
                    {selectedAppointment.dateAppointment} ·{" "}
                    {selectedAppointment.startHour} -{" "}
                    {selectedAppointment.endHour}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant={
                      selectedAppointment.isOccuped ? "destructive" : "success"
                    }
                  >
                    {selectedAppointment.isOccuped ? "Ocupada" : "Disponible"}
                  </Badge>
                  <Badge
                    variant={
                      selectedAppointment.isApproved ? "success" : "secondary"
                    }
                  >
                    {selectedAppointment.isApproved ? "Aprobada" : "Pendiente"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground border-t pt-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  {selectedAppointment.speciality?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  Duración: {selectedAppointment.duration?.interval}
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 shrink-0" />
                  Dr(a). {selectedAppointment.doctor?.name}{" "}
                  {selectedAppointment.doctor?.lastName}
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="h-3.5 w-3.5 shrink-0" />
                  Paciente: {selectedAppointment.patient?.name}{" "}
                  {selectedAppointment.patient?.lastname}
                </div>
                {selectedAppointment.roomName && (
                  <div className="flex items-center gap-2 truncate">
                    <Video className="h-3.5 w-3.5 shrink-0" />
                    Sala: {selectedAppointment.roomName}
                  </div>
                )}
                {selectedAppointment.roomUrl && (
                  <div className="flex items-center gap-2 truncate">
                    <Video className="h-3.5 w-3.5 shrink-0" />
                    <a
                      href={selectedAppointment.roomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:underline text-primary"
                    >
                      {selectedAppointment.roomUrl}
                    </a>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-4 gap-3">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                <p className="text-sm font-semibold">Notas de la cita</p>
              </div>
              <div className="space-y-3 border-t pt-3">
                {isLoadingNotes ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full rounded-md" />
                  ))
                ) : isErrorNotes ? (
                  <p className="text-sm text-destructive font-semibold text-center py-4">
                    {(notesError as Error)?.message ||
                      "Ocurrió un error inesperado"}
                  </p>
                ) : appointmentNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay notas registradas para esta cita.
                  </p>
                ) : (
                  appointmentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex gap-3 rounded-md border p-3"
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage src={note.user.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {note.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {note.user.name} {note.user.lastname}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {note.user.role}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {format(
                                new Date(note.createdAt),
                                "d MMM yyyy, HH:mm",
                                { locale: es },
                              )}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm break-words mt-1">{note.note}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AttendedPatientsPage;

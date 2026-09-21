import Container from "@/components/partials/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAppointments,
  useAssignAppointment,
  useGetDaysForYearAndMonth,
} from "@/hooks/useAppointments";
import {
  useAppointmentNotes,
  useCreateAppointmentNote,
} from "@/hooks/useAppointmentsNotes";
import { usePatients } from "@/hooks/usePatients";
import {
  useSpecialities,
  useDoctorsBySpeciality,
} from "@/hooks/useSpecialities";
import useAuth from "@/hooks/useAuth";
import { useVideoCallStore } from "@/stores/videoCallStore";
import type {
  Appointment,
  DaysAppointments,
} from "@/interfaces/appointmentsInterface";
import type { AppointmentNote } from "@/interfaces/appointmentsNotesInterface";
import type { Doctor } from "@/interfaces/doctorsInterface";
import type { Patient } from "@/interfaces/patientsInterface";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import {
  BrushCleaning,
  CalendarClockIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  FilterX,
  FunnelPlus,
  History,
  Loader2,
  RefreshCw,
  UserPlus,
  Video,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ShedulesPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}`;
  });

  // Estados para filtros
  const [specialityId, setSpecialityId] = useState<number | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [isOccupped, setIsOccupped] = useState<boolean | null>(null);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const offset = (currentPage - 1) * itemsPerPage;

  // Estados para el modal de asignación
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Estados para el panel de historial de notas
  const [selectedNotesAppointment, setSelectedNotesAppointment] =
    useState<Appointment | null>(null);
  const [newNote, setNewNote] = useState("");

  // Videollamada activa (estado global, sobrevive a la navegación entre páginas)
  const activeCallAppointment = useVideoCallStore((state) => state.appointment);
  const isCallMinimized = useVideoCallStore((state) => state.isMinimized);
  const startCall = useVideoCallStore((state) => state.startCall);
  const registerSlot = useVideoCallStore((state) => state.registerSlot);

  const slotRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      registerSlot(node);
    },
    [registerSlot],
  );

  const { getInfoUser } = useAuth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // getMonth() retorna 0-11

  // Hooks
  const {
    data: daysData,
    isLoading: isLoadingDays,
    refetch: refetchDays,
  } = useGetDaysForYearAndMonth(year, month);

  const {
    data: appointmentsData,
    isLoading: isLoadingAppointments,
    refetch: refetchAppointments,
  } = useAppointments({
    dateSelected: selectedDate || "",
    specialityId,
    doctorId,
    isOccupped,
    limit: itemsPerPage,
    offset,
  });

  const { data: specialitiesData } = useSpecialities({
    limit: null,
    offset: null,
    search: null,
  });

  const { data: doctorsData } = useDoctorsBySpeciality(specialityId || 0);

  const { data: patientsData, isLoading: isLoadingPatients } = usePatients({
    limit: 10,
    offset: null,
    search: patientSearch || null,
    status: null,
  });

  const assignAppointmentMutation = useAssignAppointment();

  const { data: notesData, isLoading: isLoadingNotes } = useAppointmentNotes(
    selectedNotesAppointment?.id || 0,
  );
  const createNoteMutation = useCreateAppointmentNote();

  // Si aterrizamos en esta página con una videollamada ya activa (ej. al
  // expandir desde la burbuja flotante), sincronizamos el panel de notas
  // con la cita de esa llamada.
  useEffect(() => {
    if (activeCallAppointment) {
      setSelectedNotesAppointment(activeCallAppointment);
    }
  }, [activeCallAppointment]);

  // Extraer los items de la respuesta de la API
  const appointments = appointmentsData?.items || [];
  const canGoNext = appointments.length === itemsPerPage;

  // Función para obtener los días del mes
  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Domingo

    return { daysInMonth, startingDayOfWeek };
  };

  // Función para obtener el color del día
  const getDayColor = (day: number) => {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    const dayData: DaysAppointments = daysData?.items?.find(
      (d: DaysAppointments) => d.calendarDate === dateString,
    );

    if (!dayData) return "bg-muted";

    return dayData.statusDay.toLowerCase() === "sin_citas"
      ? ""
      : dayData.statusDay.toLowerCase() === "ocupada"
        ? "bg-destructive"
        : "bg-green-600/50";
  };

  // Función para verificar si es el día seleccionado
  const isSelectedDay = (day: number) => {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    return selectedDate === dateString;
  };

  // Función para seleccionar un día
  const handleDayClick = (day: number) => {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    setSelectedDate(dateString);
  };

  // Navegar al mes anterior
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  // Navegar al mes siguiente
  const nextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  // Refrescar los datos de la página
  const handleRefresh = () => {
    refetchAppointments();
    refetchDays();
    toast.success("Datos actualizados");
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSpecialityId(null);
    setDoctorId(null);
    setIsOccupped(null);
    setCurrentPage(1);
  };

  // Paginación
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  // Funciones para el modal de asignación
  const handleOpenAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsAssignModalOpen(true);
    setPatientSearch("");
    setSelectedPatient(null);
  };

  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedAppointment(null);
    setPatientSearch("");
    setSelectedPatient(null);
  };

  // Funciones para el panel de historial de notas
  const handleRowClick = (appointment: Appointment) => {
    setSelectedNotesAppointment(appointment);
    setNewNote("");
  };

  const handleCloseNotesPanel = () => {
    setSelectedNotesAppointment(null);
    setNewNote("");
  };

  // Funciones para la videollamada
  const handleOpenVideoCall = (appointment: Appointment) => {
    if (activeCallAppointment && activeCallAppointment.id !== appointment.id) {
      toast.error("Ya hay una videollamada en curso");
      return;
    }

    const appointmentStartDateTime = new Date(
      `${appointment.dateAppointment}T${appointment.startHour}`,
    );
    if (appointmentStartDateTime > new Date()) {
      toast.error("No se puede ingresar, la cita aún no ha comenzado");
      return;
    }

    const appointmentEndDateTime = new Date(
      `${appointment.dateAppointment}T${appointment.endHour}`,
    );
    if (appointmentEndDateTime < new Date()) {
      toast.error("No se puede ingresar, la cita ya finalizó");
      return;
    }

    startCall(appointment);
    setSelectedNotesAppointment(appointment);
    setNewNote("");
  };

  const handleAddNote = async () => {
    if (!selectedNotesAppointment || !newNote.trim()) return;

    if (!selectedNotesAppointment.isOccuped) {
      toast.error("No se pueden agregar notas a una cita disponible");
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        note: newNote.trim(),
        appointmentId: selectedNotesAppointment.id,
        userId: getInfoUser()?.id || 0,
      });
      toast.success("Nota agregada correctamente");
      setNewNote("");
    } catch {
      toast.error("Error al agregar la nota");
    }
  };

  const handleAssignAppointment = async () => {
    if (!selectedAppointment || !selectedPatient) {
      toast.error("Debe seleccionar un paciente");
      return;
    }

    try {
      await assignAppointmentMutation.mutateAsync({
        appointmentId: selectedAppointment.id,
        patientId: selectedPatient.id,
      });
      toast.success("Cita asignada exitosamente");
      handleCloseAssignModal();
    } catch {
      toast.error("Error al asignar la cita");
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <Container
      titleModule="Agendas programadas"
      description="Gestione las agendas programadas desde este módulo."
      showButtons={false}
      icon={<CalendarClockIcon />}
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Card className="py-3 flex-1">
            <Sheet>
              <SheetTrigger className="flex-1">
                <Button className="w-full">
                  Filtros
                  <FunnelPlus />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto remove-scroll">
                <SheetHeader>
                  <SheetTitle>Filtros de agendas</SheetTitle>
                  <SheetDescription>
                    Seleccione una fecha para ver las agendas disponibles.
                  </SheetDescription>
                </SheetHeader>
                <div className="p-4 space-y-4">
                  {/* Navegación del calendario */}
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {monthNames[month - 1]} {year}
                    </h3>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Calendario */}
                  {isLoadingDays ? (
                    <div className="text-center py-8">
                      Cargando calendario...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Nombres de los días */}
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map((day) => (
                          <div
                            key={day}
                            className="text-center text-sm font-medium text-gray-500"
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Días del mes */}
                      <div className="grid grid-cols-7 gap-2">
                        {/* Espacios vacíos antes del primer día */}
                        {Array.from({ length: startingDayOfWeek }).map(
                          (_, index) => (
                            <div key={`empty-${index}`} />
                          ),
                        )}

                        {/* Días del mes */}
                        {Array.from({ length: daysInMonth }).map((_, index) => {
                          const day = index + 1;
                          const color = getDayColor(day);
                          const selected = isSelectedDay(day);

                          return (
                            <button
                              key={day}
                              onClick={() => handleDayClick(day)}
                              className={`
                                aspect-square rounded-md p-2 text-sm font-medium
                                transition-all hover:scale-105 hover:shadow-md
                                ${color}
                                ${
                                  selected
                                    ? "ring-2 ring-offset-2 ring-primary"
                                    : ""
                                }
                              `}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Fecha seleccionada */}
                  {selectedDate && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Fecha seleccionada:</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedDate}
                      </p>
                    </div>
                  )}

                  {/* Separador */}
                  <div className="border-t my-4" />

                  {/* Filtros adicionales */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        Filtros adicionales
                      </h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <FilterX className="h-4 w-4 mr-1" />
                        Limpiar
                      </Button>
                    </div>

                    {/* Filtro por especialidad */}
                    <div className="space-y-2">
                      <Label htmlFor="speciality">Especialidad</Label>
                      <Select
                        value={specialityId?.toString() || "all"}
                        onValueChange={(value) => {
                          setSpecialityId(
                            value === "all" ? null : Number(value),
                          );
                          setDoctorId(null); // Limpiar doctor al cambiar especialidad
                        }}
                      >
                        <SelectTrigger id="speciality" className="w-full">
                          <SelectValue placeholder="Todas las especialidades" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las especialidades
                          </SelectItem>
                          {specialitiesData?.items?.map(
                            (speciality: Speciality) => (
                              <SelectItem
                                key={speciality.id}
                                value={speciality.id.toString()}
                              >
                                {speciality.name}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por doctor */}
                    <div className="space-y-2">
                      <Label htmlFor="doctor">Doctor</Label>
                      <Select
                        value={doctorId?.toString() || "all"}
                        onValueChange={(value) =>
                          setDoctorId(value === "all" ? null : Number(value))
                        }
                        disabled={!specialityId}
                      >
                        <SelectTrigger id="doctor" className="w-full">
                          <SelectValue
                            placeholder={
                              specialityId
                                ? "Todos los doctores"
                                : "Seleccione primero una especialidad"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todos los doctores
                          </SelectItem>
                          {doctorsData?.items?.map((doctor: Doctor) => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id.toString()}
                            >
                              {doctor.name} {doctor.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por estado de ocupación */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={
                          isOccupped === null
                            ? "all"
                            : isOccupped
                              ? "occupied"
                              : "available"
                        }
                        onValueChange={(value) =>
                          setIsOccupped(
                            value === "all"
                              ? null
                              : value === "occupied"
                                ? true
                                : false,
                          )
                        }
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="available">Disponibles</SelectItem>
                          <SelectItem value="occupied">Ocupadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </Card>
          <Card className="py-3">
            <div className="w-full flex items-center gap-2">
              <Button
                className="flex-1"
                variant={"outline"}
                onClick={clearFilters}
              >
                Limpiar filtros
                <BrushCleaning />
              </Button>
              <Button
                className="flex-1"
                variant={"outline"}
                onClick={handleRefresh}
              >
                Refrescar
                <RefreshCw />
              </Button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {activeCallAppointment && !isCallMinimized ? (
            <Card className="py-3 flex-1 min-w-0 w-full p-4">
              <div ref={slotRefCallback} />
            </Card>
          ) : (
            <Card className="py-3 flex-1 min-w-0 w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora inicial</TableHead>
                    <TableHead>Hora final</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAppointments ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Cargando agendas...
                      </TableCell>
                    </TableRow>
                  ) : appointments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No se encontraron agendas para la fecha seleccionada
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments?.map((appointment: Appointment) => {
                      // Validar si la cita es anterior a la fecha y hora actual
                      const now = new Date();
                      const appointmentDateTime = new Date(
                        `${appointment.dateAppointment}T${appointment.startHour}`,
                      );
                      const isPastAppointment = appointmentDateTime < now;

                      // Validar si la cita aún no ha comenzado, para bloquear el ingreso
                      // a la videollamada (el room de Daily no está disponible antes de la hora de inicio)
                      const isNotStartedAppointment = appointmentDateTime > now;

                      // Validar si la cita ya finalizó, para bloquear el ingreso a la videollamada
                      const appointmentEndDateTime = new Date(
                        `${appointment.dateAppointment}T${appointment.endHour}`,
                      );
                      const isFinishedAppointment =
                        appointmentEndDateTime < now;

                      const isRowSelected =
                        selectedNotesAppointment?.id === appointment.id;

                      return (
                        <TableRow
                          key={appointment.id}
                          onClick={() => handleRowClick(appointment)}
                          className={`cursor-pointer ${
                            isRowSelected ? "bg-muted" : ""
                          }`}
                        >
                          <TableCell>{appointment.dateAppointment}</TableCell>
                          <TableCell>{appointment.startHour}</TableCell>
                          <TableCell>{appointment.endHour}</TableCell>
                          <TableCell>{appointment.duration.interval}</TableCell>
                          <TableCell>{appointment.speciality.name}</TableCell>
                          <TableCell>
                            {appointment.doctor.name}{" "}
                            {appointment.doctor.lastName}
                          </TableCell>
                          <TableCell>
                            {appointment.patient
                              ? `${appointment.patient.name} ${appointment.patient.lastname}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                appointment.isOccuped
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-green-500/10 text-green-500"
                              }`}
                            >
                              {appointment.isOccuped ? "Ocupada" : "Disponible"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(
                                  e: React.MouseEvent<HTMLButtonElement>,
                                ) => {
                                  e.stopPropagation();
                                  handleOpenAssignModal(appointment);
                                }}
                                disabled={
                                  appointment.isOccuped || isPastAppointment
                                }
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Asignar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(
                                  e: React.MouseEvent<HTMLButtonElement>,
                                ) => {
                                  e.stopPropagation();
                                  handleOpenVideoCall(appointment);
                                }}
                                disabled={
                                  !appointment.isOccuped ||
                                  isFinishedAppointment ||
                                  isNotStartedAppointment ||
                                  (!!activeCallAppointment &&
                                    activeCallAppointment.id !==
                                      appointment.id)
                                }
                                title={
                                  isFinishedAppointment
                                    ? "La cita ya finalizó"
                                    : isNotStartedAppointment
                                      ? "La cita aún no ha comenzado"
                                      : activeCallAppointment &&
                                          activeCallAppointment.id !==
                                            appointment.id
                                        ? "Ya hay una videollamada en curso"
                                        : undefined
                                }
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Videollamada
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {appointments?.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeftIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={!canGoNext}
                    >
                      <ChevronsRightIcon />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Panel de historial de notas de la cita seleccionada */}
          {selectedNotesAppointment && (
            <Card className="py-3 w-full lg:w-md shrink-0 flex flex-col max-h-[74vh] sticky top-0">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <p className="text-sm font-semibold">Historial de notas</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseNotesPanel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Información de la cita */}
              <div className="border-t mt-3 px-4 pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  {selectedNotesAppointment.dateAppointment}
                </div>
                <div>
                  <span className="text-muted-foreground">Hora:</span>{" "}
                  {selectedNotesAppointment.startHour} -{" "}
                  {selectedNotesAppointment.endHour}
                </div>
                <div>
                  <span className="text-muted-foreground">Duración:</span>{" "}
                  {selectedNotesAppointment.duration.interval}
                </div>
                <div>
                  <span className="text-muted-foreground">Especialidad:</span>{" "}
                  {selectedNotesAppointment.speciality.name}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Doctor:</span>{" "}
                  {selectedNotesAppointment.doctor.name}{" "}
                  {selectedNotesAppointment.doctor.lastName}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Paciente:</span>{" "}
                  {selectedNotesAppointment.patient
                    ? `${selectedNotesAppointment.patient.name} ${selectedNotesAppointment.patient.lastname}`
                    : "-"}
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Estado:</span>{" "}
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      selectedNotesAppointment.isOccuped
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {selectedNotesAppointment.isOccuped
                      ? "Ocupada"
                      : "Disponible"}
                  </span>
                </div>
              </div>

              <div className="border-t mt-3 px-4 pt-3 space-y-3 flex-1 min-h-0 overflow-y-auto">
                {isLoadingNotes ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Cargando notas...
                  </p>
                ) : notesData?.items?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay notas registradas para esta cita.
                  </p>
                ) : (
                  notesData?.items?.map((note: AppointmentNote) => (
                    <div
                      key={note.id}
                      className="flex gap-2 rounded-md border p-2"
                    >
                      <Avatar className="size-8">
                        <AvatarImage src={note.user.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {note.user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium">
                            {note.user.name} {note.user.lastname}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {format(new Date(note.createdAt), "d MMM, HH:mm", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-sm break-words">{note.note}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t mt-3 px-4 pt-3 space-y-2">
                {selectedNotesAppointment.isOccuped ? (
                  <>
                    <Textarea
                      placeholder="Escribe una nota sobre esta cita..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      disabled={createNoteMutation.isPending}
                      className="min-h-[70px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleAddNote}
                        disabled={
                          !newNote.trim() || createNoteMutation.isPending
                        }
                      >
                        {createNoteMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.98899 5.30778C10.169 2.90545 12.6404 1.25 15.5 1.25C19.5041 1.25 22.75 4.49594 22.75 8.5C22.75 9.57209 22.5168 10.5918 22.0977 11.5093C21.9883 11.7488 21.967 11.975 22.0156 12.1568L22.143 12.6328C22.5507 14.1566 21.1566 15.5507 19.6328 15.143L19.1568 15.0156C19.0215 14.9794 18.8616 14.982 18.6899 15.0307C18.1798 19.3775 14.4838 22.75 10 22.75C8.65003 22.75 7.36949 22.4438 6.2259 21.8963C5.99951 21.7879 5.7766 21.7659 5.59324 21.815L4.3672 22.143C2.84337 22.5507 1.44927 21.1566 1.857 19.6328L2.18504 18.4068C2.2341 18.2234 2.21211 18.0005 2.10373 17.7741C1.55623 16.6305 1.25 15.35 1.25 14C1.25 9.50945 4.63273 5.80897 8.98899 5.30778ZM10.735 5.28043C15.0598 5.64011 18.4914 9.14511 18.736 13.5016C18.9986 13.4766 19.2714 13.4935 19.5445 13.5666L20.0205 13.694C20.4293 13.8034 20.8034 13.4293 20.694 13.0205L20.5666 12.5445C20.4095 11.9571 20.5119 11.3708 20.7333 10.8861C21.0649 10.1602 21.25 9.35275 21.25 8.5C21.25 5.32436 18.6756 2.75 15.5 2.75C13.5181 2.75 11.7692 3.75284 10.735 5.28043ZM10 6.75C5.99594 6.75 2.75 9.99594 2.75 14C2.75 15.121 3.00392 16.1807 3.45667 17.1264C3.69207 17.6181 3.79079 18.2087 3.63407 18.7945L3.30602 20.0205C3.19664 20.4293 3.57066 20.8034 3.97949 20.694L5.20553 20.3659C5.79126 20.2092 6.38191 20.3079 6.87362 20.5433C7.81932 20.9961 8.87896 21.25 10 21.25C14.0041 21.25 17.25 18.0041 17.25 14C17.25 9.99594 14.0041 6.75 10 6.75Z"
                            fill="currentColor"
                          />
                          <path
                            d="M7.5 14C7.5 14.5523 7.05228 15 6.5 15C5.94772 15 5.5 14.5523 5.5 14C5.5 13.4477 5.94772 13 6.5 13C7.05228 13 7.5 13.4477 7.5 14Z"
                            fill="currentColor"
                          />
                          <path
                            d="M11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14Z"
                            fill="currentColor"
                          />
                          <path
                            d="M14.5 14C14.5 14.5523 14.0523 15 13.5 15C12.9477 15 12.5 14.5523 12.5 14C12.5 13.4477 12.9477 13 13.5 13C14.0523 13 14.5 13.4477 14.5 14Z"
                            fill="currentColor"
                          />
                        </svg>
                        Agregar nota
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Esta cita está disponible (sin paciente asignado), por lo
                    que no se pueden agregar notas.
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de asignación de citas */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Asignar cita a paciente</DialogTitle>
            <DialogDescription>
              Busque y seleccione un paciente para asignar esta cita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Información de la cita */}
            {selectedAppointment && (
              <div className="p-4 bg-muted rounded-md space-y-2">
                <h4 className="font-semibold text-sm">
                  Información de la cita
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    {new Date(
                      selectedAppointment.dateAppointment,
                    ).toLocaleDateString("es-ES")}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hora:</span>{" "}
                    {selectedAppointment.startHour} -{" "}
                    {selectedAppointment.endHour}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Especialidad:</span>{" "}
                    {selectedAppointment.speciality.name}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Doctor:</span>{" "}
                    {selectedAppointment.doctor.name}{" "}
                    {selectedAppointment.doctor.lastName}
                  </div>
                </div>
              </div>
            )}

            {/* Búsqueda de paciente */}
            <div className="space-y-2">
              <Label htmlFor="patient-search">Buscar paciente</Label>
              <Input
                id="patient-search"
                type="text"
                placeholder="Buscar por nombre, apellido, documento..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
            </div>

            {/* Lista de pacientes */}
            <div className="space-y-2">
              <Label>Pacientes encontrados</Label>
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {isLoadingPatients ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Buscando pacientes...
                  </div>
                ) : patientsData?.items?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No se encontraron pacientes
                  </div>
                ) : (
                  <div className="divide-y">
                    {patientsData?.items?.map((patient: Patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => setSelectedPatient(patient)}
                        className={`w-full p-3 text-left hover:bg-muted transition-colors ${
                          selectedPatient?.id === patient.id
                            ? "bg-primary/10 border-l-2 border-primary"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-sm">
                          {patient.name} {patient.lastname}
                        </div>
                        <div className="text-xs text-muted-foreground space-x-2">
                          <span>
                            {patient.documentType.name}: {patient.document}
                          </span>
                          <span>•</span>
                          <span>{patient.email}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Paciente seleccionado */}
            {selectedPatient && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <div className="text-sm font-medium text-green-700 dark:text-green-400">
                  Paciente seleccionado:
                </div>
                <div className="text-sm">
                  {selectedPatient.name} {selectedPatient.lastname}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseAssignModal}
                disabled={assignAppointmentMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAssignAppointment}
                disabled={
                  !selectedPatient || assignAppointmentMutation.isPending
                }
              >
                {assignAppointmentMutation.isPending
                  ? "Asignando..."
                  : "Asignar cita"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ShedulesPage;

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
import { usePatients } from "@/hooks/usePatients";
import {
  useSpecialities,
  useDoctorsBySpeciality,
} from "@/hooks/useSpecialities";
import type {
  Appointment,
  DaysAppointments,
} from "@/interfaces/appointmentsInterface";
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
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ShedulesPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
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
      day
    ).padStart(2, "0")}`;
    const dayData: DaysAppointments = daysData?.items?.find(
      (d: DaysAppointments) => d.calendarDate === dateString
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
      day
    ).padStart(2, "0")}`;
    return selectedDate === dateString;
  };

  // Función para seleccionar un día
  const handleDayClick = (day: number) => {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day
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
                          )
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
                            value === "all" ? null : Number(value)
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
                            )
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
                              : false
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

        <Card className="py-3">
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
                    `${appointment.dateAppointment}T${appointment.startHour}`
                  );
                  const isPastAppointment = appointmentDateTime < now;

                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.dateAppointment}</TableCell>
                      <TableCell>{appointment.startHour}</TableCell>
                      <TableCell>{appointment.endHour}</TableCell>
                      <TableCell>{appointment.duration.interval}</TableCell>
                      <TableCell>{appointment.speciality.name}</TableCell>
                      <TableCell>
                        {appointment.doctor.name} {appointment.doctor.lastName}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenAssignModal(appointment)}
                          disabled={appointment.isOccuped || isPastAppointment}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Asignar
                        </Button>
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
                      selectedAppointment.dateAppointment
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

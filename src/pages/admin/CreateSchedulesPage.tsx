import Container from "@/components/partials/Container";
import { Calendar } from "@/components/ui/calendar";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentCreateSchema,
  type AppointmentCreateFormValues,
} from "@/schemas/appointmentsSchema";
import { useSpecialities } from "@/hooks/useSpecialities";
import { useDoctorsBySpeciality } from "@/hooks/useSpecialities";
import { useDurations } from "@/hooks/useDurations";
import { useCreateAppointment } from "@/hooks/useAppointments";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import type { Doctor } from "@/interfaces/doctorsInterface";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CreateSchedulesPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  // Se guardan los objetos elegidos (no solo el id) porque las listas de los selects
  // se filtran en el servidor al buscar y la selección podría no estar en ellas
  const [selectedSpeciality, setSelectedSpeciality] =
    useState<Speciality | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const selectedSpecialityId = selectedSpeciality?.id ?? null;

  // Texto buscado en cada select; el endpoint se consulta con él
  const [specialitySearch, setSpecialitySearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");

  const { data: specialitiesData, isFetching: fetchingSpecialities } =
    useSpecialities({
      limit: null,
      offset: null,
      search: specialitySearch || null,
      status: true,
    });

  const {
    data: doctorsData,
    isLoading: loadingDoctors,
    isFetching: fetchingDoctors,
  } = useDoctorsBySpeciality(selectedSpecialityId || 0, doctorSearch || null);

  // Carga inicial de la lista; al buscar no debe deshabilitar el select abierto
  const loadingDoctorsList = loadingDoctors && !doctorSearch;

  const { data: durationsData } = useDurations();
  const createAppointment = useCreateAppointment();

  const form = useForm<AppointmentCreateFormValues>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: {
      specialityId: undefined,
      doctorId: undefined,
      dates: [],
      startHour: "",
      endHour: "",
      durationId: undefined,
    },
  });

  // Actualizar las fechas cuando cambie el rango seleccionado
  useEffect(() => {
    if (dateRange?.from) {
      const dates: string[] = [];
      const currentDate = new Date(dateRange.from);
      const endDate = dateRange.to || dateRange.from;

      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      form.setValue("dates", dates);
    }
  }, [dateRange, form]);

  // Resetear doctor cuando cambie la especialidad
  useEffect(() => {
    if (selectedSpecialityId) {
      form.resetField("doctorId");
      setSelectedDoctor(null);
    }
  }, [selectedSpecialityId, form]);

  const onSubmit = async (data: AppointmentCreateFormValues) => {
    // Validar que los campos opcionales estén presentes
    if (!data.specialityId || !data.doctorId) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      await createAppointment.mutateAsync({
        ...data,
        specialityId: data.specialityId,
        doctorId: data.doctorId,
      });
      toast.success(
        `${data.dates.length} agenda(s) médica(s) creada(s) exitosamente`
      );
      form.reset();
      setDateRange({ from: new Date(), to: undefined });
      setSelectedSpeciality(null);
      setSelectedDoctor(null);
    } catch (error) {
      toast.error((error as Error).message || "Error al crear las agendas");
    }
  };

  const handleClearForm = () => {
    form.reset();
    setDateRange({ from: new Date(), to: undefined });
    setSelectedSpeciality(null);
    setSelectedDoctor(null);
    toast.success("Limpiando datos seleccionados");
  };

  const selectedDates = form.watch("dates");

  return (
    <Container
      titleModule="Creación de agendas médicas"
      description="Crea y administra las agendas médicas de los doctores"
      showButtons={false}
      icon={<CalendarPlus size={30} />}
    >
      <div className="py-0.5 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 gap-y-4">
        <Card className="px-6 py-5">
          <div>
            <h3 className="text-lg font-bold">Selecciona las fechas</h3>
            <p className="text-xs text-muted-foreground">
              Elige las fechas para las cuales deseas crear las agendas médicas
            </p>
          </div>

          {/* Resumen */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <p className="text-sm font-semibold opacity-80">
              Resumen de la agenda
            </p>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Agendas médicas</Badge>
              <Badge variant="outline">Generación automática</Badge>
              <Badge variant="outline">Rango de fechas</Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Se crearán agendas médicas para cada día dentro del rango
              seleccionado. Asegúrate de que las fechas sean correctas antes de
              continuar.
            </p>
          </div>

          <Separator />

          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            className="rounded-lg border shadow-sm sm:mx-auto"
          />
        </Card>

        {/* Formulario */}
        <Card className="px-6 justify-center">
          <div>
            <h3 className="text-lg font-semibold">
              Configuración de la agenda
            </h3>
            <p className="text-xs opacity-70">
              Completa los campos para crear las agendas médicas para las fechas
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Especialidad */}
              <FormField
                control={form.control}
                name="specialityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Especialidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={
                          specialitiesData?.items?.map(
                            (speciality: Speciality) => ({
                              value: speciality.id.toString(),
                              label: speciality.name,
                            })
                          ) ?? []
                        }
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          const numValue = Number(value);
                          field.onChange(numValue);
                          setSelectedSpeciality(
                            specialitiesData?.items?.find(
                              (speciality: Speciality) =>
                                speciality.id === numValue
                            ) ?? null
                          );
                        }}
                        onSearchChange={setSpecialitySearch}
                        loading={fetchingSpecialities}
                        placeholder="Seleccione una especialidad"
                        searchPlaceholder="Buscar especialidad..."
                        emptyText="No se encontraron especialidades."
                        disabled={createAppointment.isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona la especialidad médica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Doctor */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Doctor <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={
                          doctorsData?.items?.map((doctor: Doctor) => ({
                            value: doctor.id.toString(),
                            label: `${doctor.name} ${doctor.lastName}`,
                          })) ?? []
                        }
                        value={field.value?.toString()}
                        onValueChange={(value) => {
                          const numValue = Number(value);
                          field.onChange(numValue);
                          setSelectedDoctor(
                            doctorsData?.items?.find(
                              (doctor: Doctor) => doctor.id === numValue
                            ) ?? null
                          );
                        }}
                        onSearchChange={setDoctorSearch}
                        loading={fetchingDoctors}
                        placeholder={
                          !selectedSpecialityId
                            ? "Primero selecciona una especialidad"
                            : loadingDoctorsList
                            ? "Cargando doctores..."
                            : "Seleccione un doctor"
                        }
                        searchPlaceholder="Buscar doctor..."
                        emptyText="No se encontraron doctores."
                        disabled={
                          !selectedSpecialityId ||
                          loadingDoctorsList ||
                          createAppointment.isPending
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Selecciona el doctor de la especialidad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hora de inicio y fin */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hora de inicio{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createAppointment.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hora de fin <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createAppointment.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duración de consulta */}
              <FormField
                control={form.control}
                name="durationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duración de consulta{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      key={field.value}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={createAppointment.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione la duración" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationsData?.items?.map(
                          (duration: { id: number; interval: string }) => (
                            <SelectItem
                              key={duration.id}
                              value={duration.id.toString()}
                            >
                              {duration.interval.split(":")[1]} Minutos
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tiempo de duración por consulta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botón de envío */}
              <div className="space-y-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createAppointment.isPending || selectedDates.length === 0
                  }
                >
                  {createAppointment.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crear {selectedDates.length > 0 && `${selectedDates.length}`}{" "}
                  Agenda(s)
                </Button>
                <Button
                  type="button"
                  variant={"secondary"}
                  className="w-full"
                  onClick={handleClearForm}
                  disabled={createAppointment.isPending}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="m21 3l-8 8.5m-3.554-.415c-2.48.952-4.463.789-6.446.003c.5 6.443 3.504 8.92 7.509 9.912c0 0 3.017-2.134 3.452-7.193c.047-.548.07-.821-.043-1.13c-.114-.309-.338-.53-.785-.973c-.736-.728-1.103-1.092-1.54-1.184c-.437-.09-1.007.128-2.147.565"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4.5 16.446S7 16.93 9.5 15"
                      />
                      <path
                        strokeWidth="1.5"
                        d="M8.5 7.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 4v.1"
                      />
                    </g>
                  </svg>
                  Limpiar datos
                </Button>
              </div>
            </form>
          </Form>
        </Card>
        <Card className="col-span-full px-6">
          <div>
            <h3 className="text-lg font-bold">Resumen de la configuración</h3>
            <p className="text-xs text-muted-foreground">
              Revisa los detalles antes de crear las agendas médicas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Fechas seleccionadas */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Fechas seleccionadas
              </p>
              {selectedDates.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    {selectedDates.length} día(s)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Del{" "}
                    {format(new Date(selectedDates[0]), "dd/MM/yyyy", {
                      locale: es,
                    })}{" "}
                    al{" "}
                    {format(
                      new Date(selectedDates[selectedDates.length - 1]),
                      "dd/MM/yyyy",
                      { locale: es }
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay fechas seleccionadas
                </p>
              )}
            </div>

            {/* Especialidad */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Especialidad médica
              </p>
              {selectedSpeciality ? (
                <>
                  <p className="text-lg font-bold">{selectedSpeciality.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedSpeciality.code || "------"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No seleccionada</p>
              )}
            </div>

            {/* Doctor */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Doctor asignado
              </p>
              {selectedDoctor ? (
                <p className="text-lg font-bold">
                  {selectedDoctor.name} {selectedDoctor.lastName}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No seleccionado</p>
              )}
            </div>

            {/* Horario */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Horario de atención
              </p>
              {form.watch("startHour") && form.watch("endHour") ? (
                <div className="space-y-1">
                  <p className="text-lg font-bold">
                    {form.watch("startHour")} - {form.watch("endHour")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Horario de consulta
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No configurado</p>
              )}
            </div>

            {/* Duración */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Duración por consulta
              </p>
              {form.watch("durationId") && durationsData?.items ? (
                <p className="text-lg font-bold">
                  {
                    durationsData.items
                      .find(
                        (d: { id: number }) => d.id === form.watch("durationId")
                      )
                      ?.interval.split(":")[1]
                  }{" "}
                  minutos
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No seleccionada</p>
              )}
            </div>

            {/* Total de agendas */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 space-y-2">
              <p className="text-sm font-semibold text-primary">
                Total de agendas a crear
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-primary">
                  {selectedDates.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Agenda(s) médica(s)
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default CreateSchedulesPage;

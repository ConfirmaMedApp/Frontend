import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { canRescheduleTo } from "@/config/appointmentStates";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctorsBySpeciality } from "@/hooks/useSpecialities";
import type { Appointment } from "@/interfaces/appointmentsInterface";
import type { Doctor } from "@/interfaces/doctorsInterface";
import { cn } from "@/lib/utils";
import { formatHour } from "@/utils/dates";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

const SLOTS_PER_PAGE = 20;

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Cita asignada que se va a mover (turno de origen)
  appointment: Appointment;
  isLoading?: boolean;
  onConfirm: (newAppointmentId: number, note?: string) => void | Promise<void>;
}

type RescheduleFormProps = Omit<RescheduleAppointmentDialogProps, "open">;

// El estado vive en este componente interno: Radix desmonta el contenido del
// diálogo al cerrarse, así la selección y la nota se limpian solas y las consultas
// de cupos solo corren mientras el diálogo está abierto.
const RescheduleForm = ({
  onOpenChange,
  appointment,
  isLoading = false,
  onConfirm,
}: RescheduleFormProps) => {
  // parseISO toma "yyyy-MM-dd" como fecha local; `new Date("yyyy-MM-dd")` la
  // tomaría como UTC y en Colombia mostraría el día anterior
  const originDate = useMemo(
    () => parseISO(appointment.dateAppointment),
    [appointment.dateAppointment],
  );

  const [selectedDate, setSelectedDate] = useState(originDate);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  // Texto buscado en el select de doctor (se envía al endpoint)
  const [doctorSearch, setDoctorSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<Appointment | null>(null);
  const [note, setNote] = useState("");

  // Cupos libres de la misma especialidad para la fecha elegida
  const { data: slotsData, isLoading: isLoadingSlots } = useAppointments({
    dateSelected: format(selectedDate, "yyyy-MM-dd"),
    specialityId: appointment.speciality.id,
    doctorId,
    state: "libre",
    limit: SLOTS_PER_PAGE,
    offset: (page - 1) * SLOTS_PER_PAGE,
  });

  const { data: doctorsData, isFetching: fetchingDoctors } =
    useDoctorsBySpeciality(appointment.speciality.id, doctorSearch || null);

  const slots: Appointment[] = slotsData?.items ?? [];
  const canGoNext = slots.length === SLOTS_PER_PAGE;
  const now = new Date();

  const patientName = appointment.patient
    ? `${appointment.patient.name} ${appointment.patient.lastname}`
    : "-";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Reagendar cita</DialogTitle>
        <DialogDescription>
          Elija un cupo libre de {appointment.speciality.name} posterior a la
          cita actual. El cupo actual quedará libre.
        </DialogDescription>
      </DialogHeader>

      {/* Cita actual (origen) */}
      <div className="p-4 bg-muted rounded-md space-y-2">
        <h4 className="font-semibold text-sm">Cita actual</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Fecha:</span>{" "}
            {format(originDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </div>
          <div>
            <span className="text-muted-foreground">Hora:</span>{" "}
            {formatHour(appointment.startHour)} -{" "}
            {formatHour(appointment.endHour)}
          </div>
          <div>
            <span className="text-muted-foreground">Especialidad:</span>{" "}
            {appointment.speciality.name}
          </div>
          <div>
            <span className="text-muted-foreground">Doctor:</span>{" "}
            {appointment.doctor.name} {appointment.doctor.lastName}
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Paciente:</span>{" "}
            {patientName}
          </div>
        </div>
      </div>

      {/* Selección del nuevo cupo */}
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="space-y-2">
          <Label>Nueva fecha</Label>
          {/* El destino no puede ser anterior al día de la cita actual */}
          <Calendar
            mode="single"
            required
            locale={es}
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setPage(1);
            }}
            defaultMonth={originDate}
            startMonth={originDate}
            disabled={{ before: originDate }}
            className="rounded-md border"
          />
        </div>

        <div className="space-y-4 min-w-0">
          <div className="space-y-2">
            <Label htmlFor="reschedule-doctor">Doctor</Label>
            <SearchableSelect
              id="reschedule-doctor"
              value={doctorId?.toString() ?? "all"}
              onValueChange={(value) => {
                setDoctorId(value === "all" ? null : Number(value));
                setPage(1);
              }}
              options={[
                {
                  value: "all",
                  label: "Todos los doctores",
                  localFilter: true,
                },
                ...(doctorsData?.items?.map((doctor: Doctor) => ({
                  value: doctor.id.toString(),
                  label: `${doctor.name} ${doctor.lastName}`,
                })) ?? []),
              ]}
              onSearchChange={setDoctorSearch}
              loading={fetchingDoctors}
              placeholder="Todos los doctores"
              searchPlaceholder="Buscar doctor..."
              emptyText="No se encontraron doctores."
            />
          </div>

          <div className="space-y-2">
            <Label>Horarios disponibles</Label>
            <div className="border rounded-md max-h-64 overflow-y-auto">
              {isLoadingSlots ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Cargando cupos disponibles...
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No hay cupos libres de {appointment.speciality.name} para esta
                  fecha{doctorId ? " con el doctor seleccionado" : ""}.
                </div>
              ) : (
                <div className="divide-y">
                  {slots.map((slot) => {
                    // Los cupos anteriores a la cita actual se muestran
                    // deshabilitados (no se ocultan, para no dejar páginas vacías)
                    const selectable = canRescheduleTo(appointment, slot, now);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        disabled={!selectable || isLoading}
                        title={
                          selectable
                            ? undefined
                            : "Debe ser posterior a la cita actual"
                        }
                        className={cn(
                          "w-full p-3 text-left transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
                          selectedSlot?.id === slot.id &&
                            "bg-primary/10 border-l-2 border-primary",
                        )}
                      >
                        <div className="font-medium text-sm">
                          {formatHour(slot.startHour)} -{" "}
                          {formatHour(slot.endHour)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {slot.doctor.name} {slot.doctor.lastName}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {(slots.length > 0 || page > 1) && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Página {page}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeftIcon />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={!canGoNext}
                  >
                    <ChevronsRightIcon />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cupo nuevo seleccionado (se conserva al cambiar de fecha o de página) */}
      {selectedSlot && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
          <div className="text-sm font-medium text-green-700 dark:text-green-400">
            Nuevo horario seleccionado:
          </div>
          <div className="text-sm">
            {format(
              parseISO(selectedSlot.dateAppointment),
              "EEEE d 'de' MMMM 'de' yyyy",
              { locale: es },
            )}
            , {formatHour(selectedSlot.startHour)} -{" "}
            {formatHour(selectedSlot.endHour)} · {selectedSlot.doctor.name}{" "}
            {selectedSlot.doctor.lastName}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reschedule-note">Nota (opcional)</Label>
        <Textarea
          id="reschedule-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="El paciente pidió otro horario"
          disabled={isLoading}
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Volver
        </Button>
        <Button
          onClick={() =>
            selectedSlot && onConfirm(selectedSlot.id, note.trim() || undefined)
          }
          disabled={!selectedSlot || isLoading}
        >
          {isLoading && <Spinner />}
          Reagendar cita
        </Button>
      </DialogFooter>
    </>
  );
};

// Diálogo para mover a un paciente de una cita asignada a otro cupo libre de la
// misma especialidad. La nota opcional queda en el historial de ambas citas.
const RescheduleAppointmentDialog = ({
  open,
  onOpenChange,
  isLoading = false,
  ...formProps
}: RescheduleAppointmentDialogProps) => {
  // Mientras la petición está en curso no se permite cerrar con Esc ni clic afuera
  const handleOpenChange = (value: boolean) => {
    if (!isLoading) onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <RescheduleForm
          onOpenChange={handleOpenChange}
          isLoading={isLoading}
          {...formProps}
        />
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleAppointmentDialog;

import InlineNotice from "@/components/custom/InlineNotice";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useDoctorSpecialityPrices,
  useSetDoctorSpecialityPrice,
} from "@/hooks/usePayments";
import {
  useDoctorsBySpeciality,
  useSpecialityById,
} from "@/hooks/useSpecialities";
import type { Doctor } from "@/interfaces/doctorsInterface";
import type { DoctorSpecialityPrice } from "@/interfaces/paymentsInterface";
import { formatUsd } from "@/utils/currency";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface SpecialityPricesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialityId: number;
}

interface DoctorPriceRowProps {
  doctor: Doctor;
  currentPrice: number | null;
  // Texto que se está escribiendo; undefined = sin cambios
  draft: string | undefined;
  isSaving: boolean;
  disabled: boolean;
  onDraftChange: (value: string) => void;
  onSave: () => void;
}

// Un doctor de la especialidad con su precio actual y el campo para cambiarlo.
// Es un <form> para que Enter guarde.
const DoctorPriceRow = ({
  doctor,
  currentPrice,
  draft,
  isSaving,
  disabled,
  onDraftChange,
  onSave,
}: DoctorPriceRowProps) => {
  const currentValue = currentPrice == null ? "" : String(currentPrice);
  const inputValue = draft ?? currentValue;

  const parsed = Number(inputValue);
  const isValid = inputValue.trim() !== "" && Number.isFinite(parsed) && parsed >= 0;
  const isDirty = draft !== undefined && draft.trim() !== currentValue;
  const showInvalid = draft !== undefined && inputValue.trim() !== "" && !isValid;

  return (
    <Card className="p-3 border-3">
      <form
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={(event) => {
          event.preventDefault();
          if (isDirty && isValid && !disabled) onSave();
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">
            {doctor.name} {doctor.lastName}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {/* Este endpoint se usa en otras pantallas solo por id y nombre: el documento es opcional */}
            {doctor.document && (
              <>
                <span>
                  {doctor.documentType?.name ?? "Documento"}: {doctor.document}
                </span>
                <span>•</span>
              </>
            )}
            {currentPrice == null ? (
              <Badge variant="outline">Sin precio</Badge>
            ) : (
              <span>
                Precio actual:{" "}
                <span className="font-medium text-foreground">
                  {formatUsd(currentPrice)}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-36">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              US$
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={inputValue}
              onChange={(event) => onDraftChange(event.target.value)}
              disabled={disabled || isSaving}
              aria-label={`Precio en USD de ${doctor.name} ${doctor.lastName}`}
              aria-invalid={showInvalid || undefined}
              className="pl-11"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || !isValid || disabled || isSaving}
          >
            {isSaving && <Spinner />}
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
};

// Administración de precios (USD) por doctor de una especialidad. El precio vive en la
// combinación doctor + especialidad: un mismo doctor puede cobrar distinto según la
// especialidad, y dos doctores pueden cobrar distinto por la misma. El doctor ya debe estar
// asignado a la especialidad ("Agregar doctores") para poder ponerle precio.
const SpecialityPricesModal = ({
  open,
  onOpenChange,
  specialityId,
}: SpecialityPricesModalProps) => {
  // Precios escritos y aún no guardados, por id de doctor
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingDoctorId, setSavingDoctorId] = useState<number | null>(null);

  const { data: specialityData, isLoading: loadingSpeciality } =
    useSpecialityById(specialityId);

  const { data: doctorsData, isLoading: loadingDoctors } =
    useDoctorsBySpeciality(specialityId);

  const {
    data: pricesData,
    isLoading: loadingPrices,
    isError: pricesError,
    error: pricesErrorDetail,
  } = useDoctorSpecialityPrices({
    specialityId,
    enabled: open && !!specialityId,
  });

  const setPriceMutation = useSetDoctorSpecialityPrice();

  // Al cerrar el modal o cambiar de especialidad se descartan los cambios sin guardar
  useEffect(() => {
    setDrafts({});
    setSavingDoctorId(null);
  }, [open, specialityId]);

  const doctors: Doctor[] = doctorsData?.items ?? [];

  // La lista de precios trae doctorId/specialityId; los nombres salen de los doctores de la
  // especialidad, así que se cruzan por doctorId
  const priceByDoctor = useMemo(() => {
    const items: DoctorSpecialityPrice[] = pricesData?.items ?? [];
    return new Map(items.map((price) => [price.doctorId, price]));
  }, [pricesData]);

  const isLoading = loadingSpeciality || loadingDoctors || loadingPrices;

  const handleDraftChange = (doctorId: number, value: string) => {
    setDrafts((prev) => ({ ...prev, [doctorId]: value }));
  };

  const handleSave = async (doctor: Doctor) => {
    const draft = drafts[doctor.id];
    if (draft === undefined) return;

    setSavingDoctorId(doctor.id);
    try {
      const response = await setPriceMutation.mutateAsync({
        doctorId: doctor.id,
        specialityId,
        priceUsd: Number(draft),
      });
      toast.success(response?.message || "Precio actualizado satisfactoriamente");

      // El valor guardado llega con el refetch; se descarta el borrador de este doctor
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[doctor.id];
        return next;
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el precio",
      );
    } finally {
      setSavingDoctorId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Precios por doctor</DialogTitle>
          <DialogDescription>
            Defina cuánto cobra en USD cada doctor por esta especialidad.
          </DialogDescription>
        </DialogHeader>

        {loadingSpeciality ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="h-fit p-4 border-3">
              <h1 className="font-bold text-lg">{specialityData?.items.name}</h1>
              <p className="text-xs opacity-70">{specialityData?.items.code}</p>
            </Card>

            <InlineNotice variant="info" title="El precio se define en USD">
              Wompi solo cobra en pesos colombianos (COP): al generar el cobro de
              una cita se convierte con la TRM oficial del día. Las citas ya
              creadas conservan el precio con el que nacieron; el cambio aplica a
              las agendas que se creen después.
            </InlineNotice>

            {pricesError && (
              <InlineNotice variant="error" title="No se pudieron cargar los precios">
                {pricesErrorDetail instanceof Error
                  ? pricesErrorDetail.message
                  : "Intente de nuevo en unos segundos."}
              </InlineNotice>
            )}

            <ScrollArea className="h-[340px]">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 px-6 text-center text-muted-foreground">
                  <p>Esta especialidad aún no tiene doctores asignados.</p>
                  <p className="text-xs">
                    Asígnelos primero con la opción «Agregar doctores» y vuelva
                    aquí para ponerles precio.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pr-3">
                  {doctors.map((doctor) => (
                    <DoctorPriceRow
                      key={doctor.id}
                      doctor={doctor}
                      currentPrice={priceByDoctor.get(doctor.id)?.priceUsd ?? null}
                      draft={drafts[doctor.id]}
                      isSaving={savingDoctorId === doctor.id}
                      disabled={savingDoctorId !== null}
                      onDraftChange={(value) =>
                        handleDraftChange(doctor.id, value)
                      }
                      onSave={() => handleSave(doctor)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpecialityPricesModal;

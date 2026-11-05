import { IdCard, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import DoctorAvatar from "@/components/custom/DoctorAvatar";
import { useDoctorProfile } from "@/hooks/useDoctors";
import type { Doctor, DoctorProfile } from "@/interfaces/doctorsInterface";

interface DoctorProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Doctor de la fila: permite mostrar su cabecera mientras llega la hoja de vida
  doctor: Doctor | null;
}

// Hoja de vida del doctor: datos + descripción + foto + especialidades
const DoctorProfileModal = ({
  open,
  onOpenChange,
  doctor,
}: DoctorProfileModalProps) => {
  // Solo se consulta con el modal abierto, así se refresca cada vez que se abre
  const { data, isLoading, isError, error } = useDoctorProfile(
    doctor?.id || 0,
    open
  );

  const profile: DoctorProfile | undefined = data?.items;
  const info = profile ?? doctor;
  const specialities = profile?.specialities ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Flex en columna (no el grid por defecto del Dialog): una columna de grid crece
          hasta el ancho de la palabra más larga y el texto se sale del modal. Cabecera y
          pie quedan fijos y solo el cuerpo hace scroll cuando el contenido es largo.
          Todo texto escrito por el usuario lleva `wrap-anywhere` para que también se
          parta una cadena larga sin espacios. */}
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Hoja de vida</DialogTitle>
          <DialogDescription>
            Información profesional del doctor
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {info && (
            <div className="space-y-5">
              {/* Cabecera: foto y datos básicos */}
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                <DoctorAvatar
                  src={info.photoUrl}
                  name={info.name}
                  lastName={info.lastName}
                  className="size-24 shrink-0 text-2xl"
                />
                <div className="w-full min-w-0 space-y-2 sm:w-auto sm:flex-1">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="text-xl font-semibold capitalize wrap-anywhere">
                      {info.name} {info.lastName}
                    </h2>
                    <Badge variant={info.status ? "success" : "destructive"}>
                      {info.status ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center justify-center gap-2 sm:justify-start">
                      <IdCard className="size-4 shrink-0" />
                      <span className="min-w-0 wrap-anywhere">
                        <span className="capitalize">
                          {info.documentType.name}
                        </span>
                        : {info.document}
                      </span>
                    </p>
                    <p className="flex items-center justify-center gap-2 sm:justify-start">
                      <Mail className="size-4 shrink-0" />
                      <span className="min-w-0 wrap-anywhere">{info.email}</span>
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Descripción */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Descripción</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : isError ? (
                  <p className="text-sm font-semibold text-destructive wrap-anywhere">
                    {(error as Error)?.message ||
                      "No se pudo cargar la hoja de vida"}
                  </p>
                ) : profile?.description ? (
                  <p className="text-sm leading-relaxed whitespace-pre-line wrap-anywhere">
                    {profile.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este doctor aún no tiene una descripción.
                  </p>
                )}
              </section>

              <Separator />

              {/* Especialidades */}
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">
                  Especialidades{profile ? ` (${specialities.length})` : ""}
                </h3>
                {isLoading ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : isError ? null : specialities.length > 0 ? (
                  // grid-cols-1 / grid-cols-2 son columnas minmax(0, 1fr): no crecen por el contenido
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {specialities.map((speciality) => (
                      <li key={speciality.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="min-w-0 text-sm font-medium capitalize wrap-anywhere">
                            {speciality.name}
                          </span>
                          <div className="flex shrink-0 items-center gap-1">
                            {!speciality.status && (
                              <Badge variant="destructive">Inactiva</Badge>
                            )}
                            <Badge variant="outline">{speciality.code}</Badge>
                          </div>
                        </div>
                        {speciality.description && (
                          <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line wrap-anywhere">
                            {speciality.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Este doctor aún no tiene especialidades asignadas.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorProfileModal;

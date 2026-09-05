import {
  useSpecialityById,
  useAddDoctorsToSpeciality,
  useDoctorsBySpeciality,
} from "@/hooks/useSpecialities";
import { useDoctors } from "@/hooks/useDoctors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { ScrollArea } from "../ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import type { Doctor } from "@/interfaces/doctorsInterface";

interface AddDoctorsBySpecialityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialityId: number;
}

const AddDoctorsBySpecialityModal = ({
  open,
  onOpenChange,
  specialityId,
}: AddDoctorsBySpecialityModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);

  const { data: specialityData, isLoading: loadingSpeciality } =
    useSpecialityById(specialityId);

  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors({
    limit: null,
    offset: null,
    search: search || null,
    status: true,
  });

  const { data: doctorsBySpecialityData, isLoading: loadingDoctorsBySpeciality } =
    useDoctorsBySpeciality(specialityId);

  const addDoctorsToSpeciality = useAddDoctorsToSpeciality();

  // Efecto para seleccionar automáticamente los doctores ya asociados
  useEffect(() => {
    if (doctorsBySpecialityData?.items && Array.isArray(doctorsBySpecialityData.items)) {
      const doctorIds = doctorsBySpecialityData.items.map((doctor: Doctor) => doctor.id);
      setSelectedDoctorIds(doctorIds);
    }
  }, [doctorsBySpecialityData]);

  const handleToggleDoctor = (doctorId: number) => {
    setSelectedDoctorIds((prev) =>
      prev.includes(doctorId)
        ? prev.filter((id) => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const handleSubmit = () => {
    addDoctorsToSpeciality.mutate(
      {
        specialityId,
        doctorIds: selectedDoctorIds,
      },
      {
        onSuccess: () => {
          toast.success("Doctores actualizados exitosamente");
          setSearch("");
          onOpenChange(false);
        },
        onError: () => {
          toast.error("Error al actualizar doctores de la especialidad");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar doctores a la especialidad</DialogTitle>
          <DialogDescription>
            Selecciona los doctores que deseas agregar a esta especialidad
          </DialogDescription>
        </DialogHeader>
        {loadingSpeciality ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="h-fit p-4 border-3">
              <div>
                <h1 className="font-bold text-lg">
                  {specialityData?.items.name}
                </h1>
                <p className="text-xs opacity-70">
                  {specialityData?.items.code}
                </p>
              </div>
            </Card>

            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar doctor por nombre o documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Lista de doctores */}
            <ScrollArea className="h-[300px]">
              {loadingDoctors || loadingDoctorsBySpeciality ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : doctorsData?.items && doctorsData.items.length > 0 ? (
                <div className="space-y-2">
                  {doctorsData.items.map((doctor: Doctor) => (
                    <Card
                      key={doctor.id}
                      className="p-3 cursor-pointer hover:bg-accent transition-colors border-3"
                      onClick={() => handleToggleDoctor(doctor.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedDoctorIds.includes(doctor.id)}
                          onCheckedChange={() => handleToggleDoctor(doctor.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <p className="font-medium">
                            {doctor.name} {doctor.lastName}
                          </p>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>
                              {doctor.documentType.name}: {doctor.document}
                            </span>
                            <span>•</span>
                            <span>{doctor.email}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No se encontraron doctores
                </div>
              )}
            </ScrollArea>

            {/* Footer con información de selección y botones */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                {selectedDoctorIds.length} doctor(es) seleccionado(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={addDoctorsToSpeciality.isPending}
                >
                  {addDoctorsToSpeciality.isPending
                    ? "Guardando..."
                    : "Guardar cambios"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDoctorsBySpecialityModal;

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  specialityCreateSchema,
  type SpecialityCreateSchema,
} from "@/schemas/specialitiesSchema";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import {
  useCreateSpeciality,
  useUpdateSpeciality,
  useSpecialityById,
} from "@/hooks/useSpecialities";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SpecialityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  speciality?: Speciality | null;
  mode: "create" | "edit";
}

const SpecialityModal = ({
  open,
  onOpenChange,
  speciality,
  mode,
}: SpecialityModalProps) => {
  const createMutation = useCreateSpeciality();
  const updateMutation = useUpdateSpeciality();

  // Hook para obtener especialidad por ID cuando está en modo edición
  const { data: specialityData, isLoading: isLoadingSpeciality } =
    useSpecialityById(speciality?.id || 0);

  const form = useForm<SpecialityCreateSchema>({
    resolver: zodResolver(specialityCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      status: true,
    },
  });

  // Resetear el formulario cuando se abre/cierra el modal o cambia la especialidad
  useEffect(() => {
    if (open) {
      if (mode === "edit" && specialityData?.items) {
        // Usar los datos obtenidos del servidor
        const data = specialityData.items;
        form.reset({
          name: data.name,
          description: data.description || "",
          code: data.code,
          status: data.status,
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          description: "",
          code: "",
          status: true,
        });
      }
    }
  }, [open, mode, specialityData, form]);

  const onSubmit = async (data: SpecialityCreateSchema) => {
    try {
      if (mode === "edit" && speciality) {
        // Actualizar especialidad
        await updateMutation.mutateAsync({
          id: speciality.id,
          ...data,
        });
        toast.success("Especialidad actualizada correctamente");
      } else {
        // Crear especialidad
        await createMutation.mutateAsync(data);
        toast.success("Especialidad creada correctamente");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "edit"
          ? (error as Error).message || "Error al actualizar la especialidad"
          : (error as Error).message || "Error al crear la especialidad"
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = mode === "edit" && isLoadingSpeciality;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Editar Especialidad"
              : "Crear Nueva Especialidad"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los datos de la especialidad médica"
              : "Completa los datos para registrar una nueva especialidad médica"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          // Skeleton mientras se cargan los datos de la especialidad
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nombre <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Cardiología"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código */}
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Código <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: CARD-001"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Código único identificador de la especialidad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descripción breve de la especialidad..."
                        className="resize-none"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Estado</FormLabel>
                      <FormDescription>
                        {field.value
                          ? "La especialidad está activa"
                          : "La especialidad está inactiva"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {mode === "edit" ? "Actualizar" : "Crear"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SpecialityModal;

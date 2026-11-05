import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DoctorPhotoField from "@/components/custom/DoctorPhotoField";
import {
  doctorCreateSchema,
  DOCTOR_DESCRIPTION_MAX_LENGTH,
  type DoctorCreateFormValues,
} from "@/schemas/doctorsSchema";
import type { Doctor } from "@/interfaces/doctorsInterface";
import {
  useCreateDoctor,
  useUpdateDoctor,
  useUpdateDoctorPhoto,
  useDoctorById,
} from "@/hooks/useDoctors";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";

interface DoctorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  mode: "create" | "edit";
}

const DoctorModal = ({
  open,
  onOpenChange,
  doctor,
  mode,
}: DoctorModalProps) => {
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();
  const photoMutation = useUpdateDoctorPhoto();

  // Foto elegida que se sube después de guardar los datos del doctor
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: documentTypes } = useDocumentTypes();

  // Hook para obtener doctor por ID cuando está en modo edición
  const { data: doctorData, isLoading: isLoadingDoctor } = useDoctorById(
    doctor?.id || 0
  );

  const form = useForm<DoctorCreateFormValues>({
    resolver: zodResolver(doctorCreateSchema),
    defaultValues: {
      name: "",
      lastName: "",
      document: "",
      documentTypeId: undefined,
      email: "",
      description: "",
      status: true,
    },
  });

  // La foto elegida no se conserva entre aperturas del modal
  useEffect(() => {
    if (!open) setPhotoFile(null);
  }, [open]);

  // Resetear el formulario cuando se abre/cierra el modal o cambia el doctor
  useEffect(() => {
    if (open) {
      if (mode === "edit" && doctorData?.items) {
        // Usar los datos obtenidos del servidor
        const data = doctorData.items;
        form.reset({
          name: data.name,
          lastName: data.lastName,
          document: data.document,
          documentTypeId: data.documentType.id,
          email: data.email,
          description: data.description ?? "",
          status: data.status, // Asumiendo que siempre está activo o agregar campo status
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          lastName: "",
          document: "",
          documentTypeId: undefined,
          email: "",
          description: "",
          status: true,
        });
      }
    } else {
      // Limpiar el formulario cuando se cierra el modal
      form.reset({
        name: "",
        lastName: "",
        document: "",
        documentTypeId: undefined,
        email: "",
        description: "",
        status: true,
      });
    }
  }, [open, mode, doctorData, form]);

  const onSubmit = async (data: DoctorCreateFormValues) => {
    const isEdit = mode === "edit" && !!doctor;
    // Sin descripción se manda null: en el PUT el valor se reemplaza, no se conserva
    const payload = { ...data, description: data.description || null };

    // 1) Guardar los datos del doctor (JSON)
    let doctorId: number | undefined;
    try {
      if (mode === "edit" && doctor) {
        // Actualizar doctor
        await updateMutation.mutateAsync({
          id: doctor.id,
          ...payload,
        });
        doctorId = doctor.id;
      } else {
        // Crear doctor: el id de la respuesta sirve para subir la foto
        const created = await createMutation.mutateAsync(payload);
        doctorId = created?.items?.id;
      }
    } catch (error) {
      toast.error(
        mode === "edit"
          ? (error as Error).message || "Error al actualizar el doctor"
          : (error as Error).message || "Error al crear el doctor"
      );
      return;
    }

    // 2) Subir la foto (multipart) en un endpoint aparte, solo si se eligió una.
    // Si falla, los datos ya quedaron guardados: se avisa y se cierra el modal
    // (reintentar desde aquí duplicaría el doctor al crear).
    if (photoFile) {
      try {
        if (!doctorId) {
          throw new Error("No se pudo identificar al doctor guardado");
        }
        await photoMutation.mutateAsync({ id: doctorId, file: photoFile });
      } catch (error) {
        toast.warning(
          `${isEdit ? "Doctor actualizado" : "Doctor creado"}, pero no se pudo subir la foto`,
          {
            description: `${
              (error as Error).message || "Error al subir la foto"
            }. Edita al doctor para intentarlo de nuevo.`,
          }
        );
        onOpenChange(false);
        form.reset();
        return;
      }
    }

    toast.success(
      isEdit ? "Doctor actualizado correctamente" : "Doctor creado correctamente"
    );
    onOpenChange(false);
    form.reset();
  };

  // isSubmitting cubre también el instante entre el guardado de los datos y la subida de la foto
  const isLoading =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending ||
    photoMutation.isPending;
  const isLoadingData = mode === "edit" && isLoadingDoctor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Doctor" : "Crear Nuevo Doctor"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los datos del doctor"
              : "Completa los datos para registrar un nuevo doctor"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          // Skeleton mientras se cargan los datos del doctor
          <div className="space-y-4 py-4">
            <Skeleton className="h-24 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Foto (opcional): se sube después de guardar los datos */}
              <DoctorPhotoField
                file={photoFile}
                onFileChange={setPhotoFile}
                currentPhotoUrl={doctorData?.items?.photoUrl ?? doctor?.photoUrl}
                name={form.watch("name")}
                lastName={form.watch("lastName")}
                disabled={isLoading}
              />

              {/* Nombre y Apellido */}
              <div className="grid grid-cols-2 gap-4">
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
                          placeholder="Ej: Juan"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Apellido <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Pérez"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tipo de Documento y Número */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="documentTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo de Documento{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        key={field.value}
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypes?.items?.map(
                            (type: {
                              id: number;
                              name: string;
                              code: string;
                            }) => (
                              <SelectItem
                                key={type.id}
                                value={type.id.toString()}
                              >
                                {type.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Número <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Correo Electrónico{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="doctor@ejemplo.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Descripción (hoja de vida) */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Pediatra. Universidad Nacional. Subespecialista en neonatología."
                        className="resize-none"
                        rows={4}
                        maxLength={DOCTOR_DESCRIPTION_MAX_LENGTH}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="flex items-start justify-between gap-2">
                      <FormDescription>
                        Opcional. Se muestra en la hoja de vida del doctor.
                      </FormDescription>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {field.value?.length ?? 0}/{DOCTOR_DESCRIPTION_MAX_LENGTH}
                      </span>
                    </div>
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
                          ? "El doctor está activo"
                          : "El doctor está inactivo"}
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

export default DoctorModal;

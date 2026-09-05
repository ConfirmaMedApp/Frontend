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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  doctorCreateSchema,
  type DoctorCreateFormValues,
} from "@/schemas/doctorsSchema";
import type { Doctor } from "@/interfaces/doctorsInterface";
import {
  useCreateDoctor,
  useUpdateDoctor,
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
      status: true,
    },
  });

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
          status: data.status, // Asumiendo que siempre está activo o agregar campo status
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          lastName: "",
          document: "",
          documentTypeId: undefined,
          email: "",
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
        status: true,
      });
    }
  }, [open, mode, doctorData, form]);

  const onSubmit = async (data: DoctorCreateFormValues) => {
    try {
      if (mode === "edit" && doctor) {
        // Actualizar doctor
        await updateMutation.mutateAsync({
          id: doctor.id,
          ...data,
        });
        toast.success("Doctor actualizado correctamente");
      } else {
        // Crear doctor
        await createMutation.mutateAsync(data);
        toast.success("Doctor creado correctamente");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "edit"
          ? (error as Error).message || "Error al actualizar el doctor"
          : (error as Error).message || "Error al crear el doctor"
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = mode === "edit" && isLoadingDoctor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
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
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  patientCreateSchema,
  type PatientCreateFormValues,
} from "@/schemas/patientsSchema";
import type { Patient } from "@/interfaces/patientsInterface";
import {
  useCreatePatient,
  useUpdatePatient,
  usePatientById,
} from "@/hooks/usePatients";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import { useGenders } from "@/hooks/useGenders";
import { DatePicker } from "@/components/ui/date-picker";

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient?: Patient | null;
  mode: "create" | "edit";
}

const PatientModal = ({
  open,
  onOpenChange,
  patient,
  mode,
}: PatientModalProps) => {
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const { data: documentTypes } = useDocumentTypes();
  const { data: genders } = useGenders();

  // Hook para obtener paciente por ID cuando está en modo edición
  const { data: patientData, isLoading: isLoadingPatient } = usePatientById(
    patient?.id || 0
  );

  const form = useForm<PatientCreateFormValues>({
    resolver: zodResolver(patientCreateSchema),
    defaultValues: {
      name: "",
      lastname: "",
      document: "",
      documentTypeId: undefined,
      email: "",
      phone: "",
      birthdate: "",
      genderId: undefined,
    },
  });

  // Resetear el formulario cuando se abre/cierra el modal o cambia el paciente
  useEffect(() => {
    if (open) {
      if (mode === "edit" && patientData?.items) {
        // Usar los datos obtenidos del servidor
        const data = patientData.items;
        form.reset({
          name: data.name,
          lastname: data.lastname,
          document: data.document,
          documentTypeId: data.documentType.id,
          email: data.email,
          phone: data.phone,
          birthdate: data.birthdate,
          genderId: data.gender.id,
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          lastname: "",
          document: "",
          documentTypeId: undefined,
          email: "",
          phone: "",
          birthdate: "",
          genderId: undefined,
        });
      }
    } else {
      // Limpiar el formulario cuando se cierra el modal
      form.reset({
        name: "",
        lastname: "",
        document: "",
        documentTypeId: undefined,
        email: "",
        phone: "",
        birthdate: "",
        genderId: undefined,
      });
    }
  }, [open, mode, patientData, form]);

  const onSubmit = async (data: PatientCreateFormValues) => {
    try {
      if (mode === "edit" && patient) {
        // Actualizar paciente
        await updateMutation.mutateAsync({
          id: patient.id,
          ...data,
        });
        toast.success("Paciente actualizado correctamente");
      } else {
        // Crear paciente
        await createMutation.mutateAsync(data);
        toast.success("Paciente creado correctamente");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "edit"
          ? (error as Error).message || "Error al actualizar el paciente"
          : (error as Error).message || "Error al crear el paciente"
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = mode === "edit" && isLoadingPatient;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Paciente" : "Crear Nuevo Paciente"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los datos del paciente"
              : "Completa los datos para registrar un nuevo paciente"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          // Skeleton mientras se cargan los datos del paciente
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
                          placeholder="Ej: María"
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
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Apellido <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: González"
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

              {/* Email y Teléfono */}
              <div className="grid grid-cols-2 gap-4">
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
                          placeholder="paciente@ejemplo.com"
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Teléfono <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1 234 567 890"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Fecha de Nacimiento y Género */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        Fecha de Nacimiento{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <DatePicker
                        date={field.value ? new Date(field.value) : undefined}
                        onDateChange={(date) => {
                          field.onChange(date?.toISOString().split("T")[0] || "");
                        }}
                        disabled={isLoading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Género <span className="text-destructive">*</span>
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
                          {genders?.items?.map(
                            (gender: { id: number; name: string }) => (
                              <SelectItem
                                key={gender.id}
                                value={gender.id.toString()}
                              >
                                {gender.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

export default PatientModal;

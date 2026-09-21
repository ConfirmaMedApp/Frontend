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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  userCreateSchema,
  userUpdateSchema,
  userRoles,
  type UserCreateFormValues,
  type UserUpdateFormValues,
} from "@/schemas/usersSchema";
import type { AvatarPreset, User } from "@/interfaces/usersInterface";
import {
  useAvatarPresets,
  useCreateUser,
  useUpdateUser,
  useUserById,
} from "@/hooks/useUsers";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctors } from "@/hooks/useDoctors";
import { cn } from "@/lib/utils";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  mode: "create" | "edit";
}

const UserModal = ({ open, onOpenChange, user, mode }: UserModalProps) => {
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const { data: doctors } = useDoctors({
    limit: null,
    offset: null,
    search: null,
  });

  const { data: avatarPresets } = useAvatarPresets();

  // Hook para obtener usuario por ID cuando está en modo edición
  const { data: userData, isLoading: isLoadingUser } = useUserById(
    user?.id || 0
  );

  const form = useForm<UserCreateFormValues | UserUpdateFormValues>({
    resolver: zodResolver(mode === "edit" ? userUpdateSchema : userCreateSchema),
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      username: "",
      password: "",
      doctorId: null,
      status: true,
      role: undefined,
      avatarPresetKey: undefined,
    },
  });

  // Resetear el formulario cuando se abre/cierra el modal o cambia el usuario
  useEffect(() => {
    if (open) {
      if (mode === "edit" && userData?.items) {
        // Usar los datos obtenidos del servidor
        const data = userData.items;
        form.reset({
          id: data.id,
          name: data.name,
          lastname: data.lastname,
          email: data.email,
          username: data.username,
          password: "",
          doctorId: data.doctor?.id ?? null,
          status: data.status,
          role: data.role as (typeof userRoles)[number],
        });
      } else if (mode === "create") {
        form.reset({
          name: "",
          lastname: "",
          email: "",
          username: "",
          password: "",
          doctorId: null,
          status: true,
          role: undefined,
          avatarPresetKey: undefined,
        });
      }
    } else {
      // Limpiar el formulario cuando se cierra el modal
      form.reset({
        name: "",
        lastname: "",
        email: "",
        username: "",
        password: "",
        doctorId: null,
        status: true,
        role: undefined,
        avatarPresetKey: undefined,
      });
    }
  }, [open, mode, userData, form]);

  const onSubmit = async (data: UserCreateFormValues | UserUpdateFormValues) => {
    try {
      if (mode === "edit") {
        // Actualizar usuario
        await updateMutation.mutateAsync(data as UserUpdateFormValues);
        toast.success("Usuario actualizado correctamente");
      } else {
        // Crear usuario
        await createMutation.mutateAsync(data as UserCreateFormValues);
        toast.success("Usuario creado correctamente");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        mode === "edit"
          ? (error as Error).message || "Error al actualizar el usuario"
          : (error as Error).message || "Error al crear el usuario"
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLoadingData = mode === "edit" && isLoadingUser;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Modifica los datos del usuario"
              : "Completa los datos para registrar un nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          // Skeleton mientras se cargan los datos del usuario
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
                  name="lastname"
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

              {/* Email y Username */}
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
                          placeholder="usuario@ejemplo.com"
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Usuario <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="usuario123"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contraseña */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Contraseña{" "}
                      {mode === "create" && (
                        <span className="text-destructive">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={
                          mode === "edit"
                            ? "Dejar vacío para no cambiar"
                            : "Mínimo 8 caracteres"
                        }
                        {...field}
                        disabled={isLoading || mode === "edit"}
                      />
                    </FormControl>
                    {mode === "edit" && (
                      <FormDescription>
                        Comunicate con soporte para cambiar la contraseña.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Oficina y Doctor */}
              <div className="">
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Doctor <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        key={field.value}
                        onValueChange={(value) =>
                          field.onChange(value === "none" ? null : Number(value))
                        }
                        value={field.value == null ? "none" : field.value.toString()}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          {doctors?.items?.map(
                            (doctor: {
                              id: number;
                              name: string;
                              lastName: string;
                            }) => (
                              <SelectItem
                                key={doctor.id}
                                value={doctor.id.toString()}
                              >
                                {doctor.name} {doctor.lastName}
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

              {/* Avatar (solo al crear) */}
              {mode === "create" && (
                <FormField
                  control={form.control}
                  name="avatarPresetKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Avatar <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-6 gap-2">
                          {avatarPresets?.items?.map(
                            (preset: AvatarPreset) => (
                              <button
                                key={preset.key}
                                type="button"
                                onClick={() => field.onChange(preset.key)}
                                disabled={isLoading}
                                className={cn(
                                  "rounded-full ring-offset-2 ring-offset-background transition-all hover:scale-105",
                                  field.value === preset.key &&
                                    "ring-2 ring-primary"
                                )}
                              >
                                <Avatar className="size-16 mx-auto">
                                  <AvatarImage src={preset.url} />
                                  <AvatarFallback>?</AvatarFallback>
                                </Avatar>
                              </button>
                            )
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Rol */}
              <div className="">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Rol <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          ? "El usuario está activo"
                          : "El usuario está inactivo"}
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

export default UserModal;

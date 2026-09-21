import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAvatarPresets, useUpdateAvatar } from "@/hooks/useUsers";
import type { AvatarPreset } from "@/interfaces/usersInterface";
import { compressImage } from "@/utils/compressImage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";

interface AvatarUpdateSectionProps {
  userId: number;
  currentAvatarUrl?: string;
  currentName?: string;
}

const AvatarUpdateSection = ({
  userId,
  currentAvatarUrl,
  currentName,
}: AvatarUpdateSectionProps) => {
  const [avatarMode, setAvatarMode] = useState<"preset" | "file">("preset");
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: avatarPresets } = useAvatarPresets();
  const updateAvatarMutation = useUpdateAvatar();

  // Actualizar la previsualización del avatar según la selección actual
  useEffect(() => {
    if (avatarMode === "file" && selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (avatarMode === "preset" && selectedPresetKey) {
      const preset = avatarPresets?.items?.find(
        (p: AvatarPreset) => p.key === selectedPresetKey
      );
      setPreviewUrl(preset?.url ?? null);
      return;
    }

    setPreviewUrl(null);
  }, [avatarMode, selectedFile, selectedPresetKey, avatarPresets]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }

    setIsCompressing(true);
    try {
      const compressed = await compressImage(file);
      setSelectedFile(compressed);
    } catch {
      toast.error("No se pudo procesar la imagen");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSaveAvatar = async () => {
    try {
      await updateAvatarMutation.mutateAsync({
        id: userId,
        presetKey:
          avatarMode === "preset" ? selectedPresetKey ?? undefined : undefined,
        file: avatarMode === "file" ? selectedFile ?? undefined : undefined,
      });
      toast.success("Avatar actualizado correctamente");
      setSelectedPresetKey(null);
      setSelectedFile(null);
    } catch (error) {
      toast.error((error as Error).message || "Error al actualizar el avatar");
    }
  };

  const isSavingAvatar = updateAvatarMutation.isPending;
  const isBusy = isSavingAvatar || isCompressing;
  const canSaveAvatar =
    avatarMode === "preset" ? !!selectedPresetKey : !!selectedFile;

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar className="size-16">
          <AvatarImage src={previewUrl ?? currentAvatarUrl} />
          <AvatarFallback>{currentName?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Avatar</p>
          <p className="text-xs text-muted-foreground">
            Elige un avatar predefinido o sube tu propia imagen.
          </p>
        </div>
      </div>

      <Tabs
        value={avatarMode}
        onValueChange={(value) => {
          setAvatarMode(value as "preset" | "file");
          setSelectedPresetKey(null);
          setSelectedFile(null);
        }}
      >
        <TabsList className="space-x-2">
          <TabsTrigger value="preset">Predefinido</TabsTrigger>
          <TabsTrigger value="file">Subir imagen</TabsTrigger>
        </TabsList>
        <TabsContent value="preset">
          <div className="grid grid-cols-6 gap-2">
            {avatarPresets?.items?.map((preset: AvatarPreset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => setSelectedPresetKey(preset.key)}
                disabled={isBusy}
                className={cn(
                  "rounded-full ring-offset-2 ring-offset-background transition-all hover:scale-105",
                  selectedPresetKey === preset.key && "ring-2 ring-primary"
                )}
              >
                <Avatar className="size-16 mx-auto">
                  <AvatarImage src={preset.url} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="file">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            )}
          >
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arrastra una imagen aquí o haz clic para seleccionarla
            </p>
            {isCompressing && (
              <p className="text-xs text-muted-foreground">
                Comprimiendo imagen...
              </p>
            )}
            {selectedFile && !isCompressing && (
              <p className="text-xs font-medium">{selectedFile.name}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isBusy}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={handleSaveAvatar}
          disabled={!canSaveAvatar || isBusy}
        >
          {isSavingAvatar && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar avatar
        </Button>
      </div>
    </div>
  );
};

export default AvatarUpdateSection;

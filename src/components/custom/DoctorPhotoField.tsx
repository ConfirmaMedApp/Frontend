import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DoctorAvatar from "@/components/custom/DoctorAvatar";
import { compressImage } from "@/utils/compressImage";

// Reglas de la API para la foto del doctor
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

interface DoctorPhotoFieldProps {
  // Archivo elegido que se subirá al guardar (null si no hay ninguno)
  file: File | null;
  onFileChange: (file: File | null) => void;
  // Foto que el doctor ya tiene guardada
  currentPhotoUrl?: string | null;
  // Para las iniciales del respaldo cuando no hay foto
  name?: string;
  lastName?: string;
  disabled?: boolean;
}

// Selector de la foto (opcional) del doctor. Solo elige y previsualiza el archivo:
// la subida la hace el formulario al guardar, porque la foto va en un endpoint aparte
// (PUT /doctors/{id}/photo) y al crear el doctor todavía no existe su id.
const DoctorPhotoField = ({
  file,
  onFileChange,
  currentPhotoUrl,
  name,
  lastName,
  disabled = false,
}: DoctorPhotoFieldProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Previsualización del archivo elegido
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = async (selected: File) => {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      toast.error("La foto debe ser una imagen JPEG, PNG, GIF o WebP");
      return;
    }

    setIsCompressing(true);
    try {
      // Se reduce y recodifica en el navegador para no subir fotos pesadas (igual que el avatar)
      const compressed = await compressImage(selected);
      if (compressed.size > MAX_SIZE_BYTES) {
        toast.error("La foto no puede superar los 5 MB");
        return;
      }
      onFileChange(compressed);
    } catch {
      toast.error("No se pudo procesar la imagen");
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
    // Permite volver a elegir el mismo archivo después de quitarlo
    e.target.value = "";
  };

  const isBusy = disabled || isCompressing;
  const hasPhoto = !!file || !!currentPhotoUrl;

  return (
    <div className="flex items-center gap-4 rounded-lg border p-3">
      <DoctorAvatar
        src={previewUrl ?? currentPhotoUrl}
        name={name}
        lastName={lastName}
        className="size-16 text-lg"
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-sm font-medium">
            Foto{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, GIF o WebP. Máximo 5 MB.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
          >
            {isCompressing ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {isCompressing
              ? "Procesando..."
              : hasPhoto
              ? "Cambiar foto"
              : "Seleccionar foto"}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onFileChange(null)}
              disabled={isBusy}
            >
              <X />
              Quitar selección
            </Button>
          )}
        </div>

        {file && (
          <p className="truncate text-xs text-muted-foreground">
            {file.name} · se subirá al guardar
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleInputChange}
          disabled={isBusy}
        />
      </div>
    </div>
  );
};

export default DoctorPhotoField;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";

interface AppointmentStateActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  notePlaceholder?: string;
  isLoading?: boolean;
  onConfirm: (note?: string) => void | Promise<void>;
}

type ActionFormProps = Omit<AppointmentStateActionDialogProps, "open">;

// La nota vive en este componente interno: Radix desmonta el contenido del
// diálogo al cerrarse (incluso cuando el padre lo cierra por la prop `open`),
// así la nota se limpia sola y no reaparece en la siguiente cita.
const ActionForm = ({
  onOpenChange,
  title,
  description,
  confirmLabel,
  notePlaceholder,
  isLoading = false,
  onConfirm,
}: ActionFormProps) => {
  const [note, setNote] = useState("");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <div className="space-y-2">
        <Label htmlFor="appointment-state-note">Nota (opcional)</Label>
        <Textarea
          id="appointment-state-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={notePlaceholder}
          disabled={isLoading}
        />
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          Volver
        </Button>
        <Button
          variant="destructive"
          onClick={() => onConfirm(note.trim() || undefined)}
          disabled={isLoading}
        >
          {isLoading && <Spinner />}
          {confirmLabel}
        </Button>
      </DialogFooter>
    </>
  );
};

// Diálogo único para Cancelar y Marcar no asistió: ambos aceptan una nota
// opcional que queda en el historial de la cita.
const AppointmentStateActionDialog = ({
  open,
  onOpenChange,
  isLoading = false,
  ...formProps
}: AppointmentStateActionDialogProps) => {
  // Mientras la petición está en curso no se permite cerrar con Esc ni clic afuera
  const handleOpenChange = (value: boolean) => {
    if (!isLoading) onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-7xl">
        <ActionForm
          onOpenChange={handleOpenChange}
          isLoading={isLoading}
          {...formProps}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentStateActionDialog;

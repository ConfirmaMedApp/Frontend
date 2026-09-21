import { create } from "zustand";
import type { Appointment } from "@/interfaces/appointmentsInterface";

interface VideoCallState {
  appointment: Appointment | null;
  isMinimized: boolean;
  slotNode: HTMLElement | null;
  startCall: (appointment: Appointment) => void;
  leaveCall: () => void;
  minimize: () => void;
  expand: () => void;
  registerSlot: (node: HTMLElement | null) => void;
}

// Estado global de la videollamada activa, vive fuera del router para
// sobrevivir a la navegación entre páginas
export const useVideoCallStore = create<VideoCallState>((set) => ({
  appointment: null,
  isMinimized: false,
  slotNode: null,
  startCall: (appointment) => set({ appointment, isMinimized: false }),
  leaveCall: () => set({ appointment: null, isMinimized: false }),
  minimize: () => set({ isMinimized: true }),
  expand: () => set({ isMinimized: false }),
  registerSlot: (node) => set({ slotNode: node }),
}));

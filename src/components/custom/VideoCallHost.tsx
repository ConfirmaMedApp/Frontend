import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import VideoCallPanel from "@/components/custom/VideoCallPanel";
import { isTerminalState } from "@/config/appointmentStates";
import {
  APPOINTMENTS_REFETCH_INTERVAL,
  useAppointmentById,
  useDoctorVideoToken,
} from "@/hooks/useAppointments";
import { useVideoCallStore } from "@/stores/videoCallStore";
import type { DoctorVideoCredentials } from "@/interfaces/appointmentsInterface";

// Host global de la videollamada: vive fuera del router (montado en el layout)
// para sobrevivir a la navegación entre páginas. Renderiza el video embebido
// dentro de la página de agendas (via portal) o como burbuja flotante en
// cualquier otra página, sin perder la conexión activa. El Picture-in-Picture
// real del navegador (para seguir viendo la llamada al cambiar de pestaña) lo
// maneja directamente el <video> dentro de VideoCallPanel.
//
// IMPORTANTE: el contenido de la llamada SIEMPRE se renderiza a través de
// createPortal, nunca como hijo directo. Si en algún render se retornara el
// contenido como hijo normal y en otro render como portal, React vería una
// forma de árbol distinta entre ambos casos y desmontaría/remontaría todo el
// subárbol (incluido el DailyProvider), colgando la llamada. Por eso el
// contenedor "burbuja" también es un nodo persistente, nunca condicional.
const VideoCallHost = () => {
  const appointment = useVideoCallStore((state) => state.appointment);
  const isMinimized = useVideoCallStore((state) => state.isMinimized);
  const slotNode = useVideoCallStore((state) => state.slotNode);
  const minimize = useVideoCallStore((state) => state.minimize);
  const expand = useVideoCallStore((state) => state.expand);
  const leaveCall = useVideoCallStore((state) => state.leaveCall);
  const navigate = useNavigate();

  const [bubbleContainer, setBubbleContainer] =
    useState<HTMLDivElement | null>(null);
  const bubbleRefCallback = useCallback((node: HTMLDivElement | null) => {
    setBubbleContainer(node);
  }, []);

  const {
    data: videoTokenData,
    isLoading,
    isError,
  } = useDoctorVideoToken(appointment?.id || 0);
  const credentials: DoctorVideoCredentials | undefined =
    videoTokenData?.items;

  // Al pasar a un estado final (finalizada, cancelada, no_asistio) el backend
  // libera la sala de Daily. Se consulta la cita mientras dure la llamada para
  // cerrarla de forma controlada en lugar de dejarla colgada. Las mutaciones de
  // estado invalidan esta query, así que marcar "no asistió" durante la llamada
  // la cierra de inmediato, sin esperar al intervalo.
  const { data: liveAppointmentData } = useAppointmentById(
    appointment?.id || 0,
    { refetchInterval: APPOINTMENTS_REFETCH_INTERVAL },
  );
  const liveState = liveAppointmentData?.items?.state;

  useEffect(() => {
    if (liveState && isTerminalState(liveState.code)) {
      toast.info(`La cita pasó a "${liveState.name}". La videollamada se cerró.`);
      leaveCall();
    }
  }, [liveState, leaveCall]);

  const isEmbedded = !isMinimized && !!slotNode;
  const isFloating = !isEmbedded;
  const portalTarget = isEmbedded ? slotNode : bubbleContainer;

  const handleExpand = () => {
    expand();
    navigate("/schedules");
  };

  let body: React.ReactNode = null;

  if (appointment) {
    if (isLoading) {
      body = (
        <div
          className={
            isFloating
              ? "flex items-center justify-center gap-2 h-48 w-72 text-sm text-muted-foreground"
              : "flex items-center justify-center gap-2 h-[60vh] max-h-[70vh] text-sm text-muted-foreground"
          }
        >
          <Spinner /> Generando acceso a la videollamada...
        </div>
      );
    } else if (isError || !credentials) {
      body = (
        <div
          className={
            isFloating
              ? "flex flex-col items-center justify-center gap-2 h-48 w-72 p-3 text-center"
              : "flex flex-col items-center justify-center gap-3 h-[60vh] max-h-[70vh]"
          }
        >
          <p className="text-sm text-destructive text-center">
            No se pudo obtener el acceso a la videollamada.
          </p>
          <Button variant="outline" onClick={leaveCall}>
            Cerrar
          </Button>
        </div>
      );
    } else {
      const endsAt = new Date(credentials.expiresAt);

      body = (
        <VideoCallPanel
          roomUrl={credentials.roomUrl}
          token={credentials.token}
          isFloating={isFloating}
          endsAt={endsAt}
          onLeave={leaveCall}
          onMinimize={minimize}
          onExpand={handleExpand}
        />
      );
    }
  }

  return (
    <>
      <div
        ref={bubbleRefCallback}
        className="fixed bottom-4 right-4 z-50 rounded-lg border bg-card shadow-lg overflow-hidden"
        hidden={!appointment || portalTarget !== bubbleContainer}
      />
      {body && portalTarget && createPortal(body, portalTarget)}
    </>
  );
};

export default VideoCallHost;

import { useEffect, useState } from "react";
import {
  DailyAudio,
  DailyProvider,
  DailyVideo,
  useDaily,
  useDailyEvent,
  useLocalSessionId,
  useMeetingState,
  useParticipantIds,
} from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCountdown } from "@/hooks/useCountdown";

interface VideoCallPanelProps {
  roomUrl: string;
  token: string;
  isFloating: boolean;
  endsAt: Date | null;
  onLeave: () => void;
  onMinimize: () => void;
  onExpand: () => void;
}

// Contenido de la videollamada del doctor. Se renderiza en modo "embebido"
// (dentro de la página de agendas) o "flotante" (burbuja sobre cualquier
// página) según isFloating, pero mantiene una única conexión activa a Daily.
const VideoCallPanel = ({
  roomUrl,
  token,
  isFloating,
  endsAt,
  onLeave,
  onMinimize,
  onExpand,
}: VideoCallPanelProps) => {
  return (
    <DailyProvider url={roomUrl} token={token}>
      <VideoCallContent
        isFloating={isFloating}
        endsAt={endsAt}
        onLeave={onLeave}
        onMinimize={onMinimize}
        onExpand={onExpand}
      />
    </DailyProvider>
  );
};

const VideoCallContent = ({
  isFloating,
  endsAt,
  onLeave,
  onMinimize,
  onExpand,
}: Omit<VideoCallPanelProps, "roomUrl" | "token">) => {
  const daily = useDaily();
  const meetingState = useMeetingState();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  useEffect(() => {
    if (!daily) return;
    daily.join();

    return () => {
      daily.leave();
    };
  }, [daily]);

  useDailyEvent("camera-error", () => {
    toast.error(
      "No se pudo acceder a la cámara o al micrófono. Verifique los permisos del navegador.",
    );
  });

  const handleToggleMic = () => {
    if (!daily) return;
    daily.setLocalAudio(!isMicOn);
    setIsMicOn((prev) => !prev);
  };

  const handleToggleCamera = () => {
    if (!daily) return;
    daily.setLocalVideo(!isCameraOn);
    setIsCameraOn((prev) => !prev);
  };

  const handleLeave = async () => {
    if (daily) {
      await daily.leave();
    }
    onLeave();
  };

  const isConnecting =
    meetingState === "new" || meetingState === "joining-meeting";
  const isError = meetingState === "error";

  const { label: countdownLabel, isOver: isTimeOver } = useCountdown(endsAt);

  return (
    <div className={cn("flex flex-col", !isFloating && "gap-3")}>
      <div
        className={cn(
          "relative bg-muted overflow-hidden",
          isFloating ? "h-48 w-72" : "rounded-md h-[60vh] max-h-[70vh]",
        )}
      >
        {isError ? (
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-destructive">
            Ocurrió un error al conectar con la videollamada. Intente
            nuevamente.
          </div>
        ) : isConnecting ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Conectando a la videollamada...
          </div>
        ) : (
          <>
            {remoteParticipantIds.length > 0 ? (
              remoteParticipantIds.map((id) => (
                <DailyVideo
                  key={id}
                  sessionId={id}
                  automirror
                  fit="contain"
                  className="w-full h-full"
                />
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
                Esperando a que el paciente se una...
              </div>
            )}

            {localSessionId && (
              <div
                className={cn(
                  "absolute bottom-2 right-2 rounded-md overflow-hidden border-2 border-background shadow-md",
                  isFloating ? "w-16 h-12" : "w-32 h-24 sm:w-40 sm:h-28",
                )}
              >
                <DailyVideo
                  sessionId={localSessionId}
                  automirror
                  fit="contain"
                  className="w-full h-full"
                />
              </div>
            )}

            <DailyAudio />
          </>
        )}

        {/* Tiempo restante de la cita */}
        {countdownLabel && (
          <div
            className={cn(
              "absolute top-1 left-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
              isTimeOver
                ? "bg-destructive text-destructive-foreground"
                : "bg-black/60 text-white",
            )}
          >
            {countdownLabel}
          </div>
        )}

        {/* Controles superpuestos en modo flotante */}
        {isFloating && (
          <div className="absolute top-1 right-1 flex gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="size-6"
              onClick={onExpand}
              title="Expandir"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Controles de la llamada */}
      <div
        className={cn(
          "flex items-center justify-center gap-2",
          isFloating && "mt-1",
        )}
      >
        <Button
          variant={isMicOn ? "outline" : "destructive"}
          size="icon"
          onClick={handleToggleMic}
          disabled={isConnecting || isError}
        >
          {isMicOn ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={isCameraOn ? "outline" : "destructive"}
          size="icon"
          onClick={handleToggleCamera}
          disabled={isConnecting || isError}
        >
          {isCameraOn ? (
            <Video className="h-4 w-4" />
          ) : (
            <VideoOff className="h-4 w-4" />
          )}
        </Button>
        {!isFloating && (
          <Button variant="outline" size="icon" onClick={onMinimize}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="destructive"
          onClick={handleLeave}
          size={isFloating ? "icon" : "default"}
        >
          <PhoneOff className={cn("h-4 w-4", !isFloating && "mr-1")} />
          {!isFloating && "Salir de la llamada"}
        </Button>
      </div>
    </div>
  );
};

export default VideoCallPanel;

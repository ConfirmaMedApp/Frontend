import { useEffect, useState } from "react";

// Calcula y actualiza cada segundo el tiempo restante hasta una fecha límite
export const useCountdown = (targetDate: Date | null) => {
  const [msRemaining, setMsRemaining] = useState<number | null>(
    targetDate ? targetDate.getTime() - Date.now() : null,
  );

  useEffect(() => {
    if (!targetDate) {
      setMsRemaining(null);
      return;
    }

    const tick = () => setMsRemaining(targetDate.getTime() - Date.now());
    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  if (msRemaining === null) {
    return { msRemaining: null, label: "" };
  }

  const isOver = msRemaining <= 0;
  const totalSeconds = Math.max(0, Math.floor(msRemaining / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const label = isOver
    ? "Tiempo finalizado"
    : hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} restantes`
      : `${minutes}:${String(seconds).padStart(2, "0")} restantes`;

  return { msRemaining, isOver, label };
};

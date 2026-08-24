import type { ConnectionStatus as WebSocketConnectionStatus } from "@/types/websocket";

interface ConnectionStatusProps {
  status: WebSocketConnectionStatus;
  retryCount?: number;
}

const statusStyles: Record<WebSocketConnectionStatus, { dot: string; label: string }> = {
  CONNECTED: {
    dot: "bg-gain-bright animate-pulse",
    label: "Conectado",
  },
  CONNECTING: {
    dot: "bg-amber-400 animate-pulse",
    label: "Conectando...",
  },
  RECONNECTING: {
    dot: "bg-amber-400 animate-pulse",
    label: "Reconectando...",
  },
  DISCONNECTED: {
    dot: "bg-loss-bright",
    label: "Desconectado - Modo Offline",
  },
};

export function ConnectionStatus({ status, retryCount = 0 }: ConnectionStatusProps) {
  const { dot, label } = statusStyles[status];
  const retryLabel = status === "RECONNECTING" ? ` Reintento ${retryCount}` : "";

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex h-7 items-center gap-2 border border-white/10 bg-financial-card px-2.5 text-xs font-medium text-zinc-200"
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${dot}`} />
      {`${label}${retryLabel}`}
    </span>
  );
}
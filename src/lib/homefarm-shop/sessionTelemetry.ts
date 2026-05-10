import type { GameMode } from "@/types/homefarm-shop";

export type SessionOutcome = "game_over" | "restart" | "win";

export type SessionTelemetryEntry = {
  id: string;
  started_at: string;
  ended_at: string;
  game_mode: GameMode;
  outcome: SessionOutcome;
  day_reached: number;
  reached_god_mode: boolean;
  playtime_ms: number;
  total_revenue: number;
  total_profit: number;
  served_count: number;
  max_combo: number;
};

const LOCAL_KEY = "homefarm_shop_sessions";

function readSessions(): SessionTelemetryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSessions(entries: SessionTelemetryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(-50)));
}

export function recordSessionTelemetry(entry: Omit<SessionTelemetryEntry, "id">) {
  const current = readSessions();
  current.push({ ...entry, id: crypto.randomUUID() });
  writeSessions(current);
}

export function getLatestSessionTelemetry() {
  return readSessions().sort((a, b) => b.ended_at.localeCompare(a.ended_at))[0] || null;
}

export function getSessionTelemetryCount() {
  return readSessions().length;
}

export function formatSessionDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

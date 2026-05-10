import { isSupabaseReady, supabase } from "@/lib/supabaseClient";

export type LeaderboardMode = "part-time" | "full-time";
export type LeaderboardModeView = LeaderboardMode | "unknown";

export type LeaderboardEntry = {
  id?: string;
  player_name: string;
  game_mode?: LeaderboardMode;
  score: number;
  day_reached: number;
  cash: number;
  total_revenue: number;
  total_profit: number;
  max_combo: number;
  served_count: number;
  created_at?: string;
};

const LOCAL_KEY = "homefarm_shop_leaderboard";
const SUPABASE_PAGE_SIZE = 1000;

export async function saveLeaderboardEntry(entry: LeaderboardEntry) {
  if (isSupabaseReady && supabase) {
    const { error } = await supabase.from("homefarm_shop_leaderboard").insert(entry);
    if (error) throw error;
    return;
  }

  const current = getLocalLeaderboard();
  current.push({ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() });
  localStorage.setItem(LOCAL_KEY, JSON.stringify(current.sort(sortLeaderboardEntries)));
}

export async function fetchLeaderboard() {
  if (isSupabaseReady && supabase) {
    const entries: LeaderboardEntry[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("homefarm_shop_leaderboard")
        .select("*")
        .order("score", { ascending: false })
        .order("created_at", { ascending: true })
        .range(from, from + SUPABASE_PAGE_SIZE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      entries.push(...data);
      if (data.length < SUPABASE_PAGE_SIZE) break;
      from += SUPABASE_PAGE_SIZE;
    }

    return entries;
  }

  return getLocalLeaderboard().sort(sortLeaderboardEntries);
}

export function getLeaderboardModeView(mode?: string | null): LeaderboardModeView {
  if (mode === "part-time" || mode === "full-time") return mode;
  return "unknown";
}

export function getLeaderboardModeLabel(mode?: string | null) {
  const view = getLeaderboardModeView(mode);
  if (view === "part-time") return "Ca Part-time";
  if (view === "full-time") return "Ca Full-time";
  return "Ca chưa rõ";
}

export function getLeaderboardErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message || "").trim();
    const code = String((error as { code?: unknown }).code || "").trim();
    if (code === "42703" && message.includes("game_mode")) {
      return "Supabase thiếu cột game_mode. Chạy migration supabase/homefarm_shop_leaderboard.sql.";
    }
    if (message) return message;
  }
  return "Không rõ nguyên nhân";
}

function getLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function sortLeaderboardEntries(a: LeaderboardEntry, b: LeaderboardEntry) {
  if (b.score !== a.score) return b.score - a.score;
  return String(a.created_at || "").localeCompare(String(b.created_at || ""));
}

export function getLeaderboardMode() {
  return isSupabaseReady && supabase ? "supabase" : "local";
}

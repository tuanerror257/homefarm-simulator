import { isSupabaseReady, supabase } from "@/lib/supabaseClient";

export type LeaderboardEntry = {
  id?: string;
  player_name: string;
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

export async function saveLeaderboardEntry(entry: LeaderboardEntry) {
  if (isSupabaseReady && supabase) {
    const { error } = await supabase.from("homefarm_shop_leaderboard").insert(entry);
    if (error) throw error;
    return;
  }

  const current = getLocalLeaderboard();
  current.push({ ...entry, id: crypto.randomUUID(), created_at: new Date().toISOString() });
  localStorage.setItem(LOCAL_KEY, JSON.stringify(current.sort((a, b) => b.score - a.score).slice(0, 50)));
}

export async function fetchLeaderboard() {
  if (isSupabaseReady && supabase) {
    const { data, error } = await supabase
      .from("homefarm_shop_leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  return getLocalLeaderboard().sort((a, b) => b.score - a.score).slice(0, 20);
}

function getLocalLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}


export function getLeaderboardMode() {
  return isSupabaseReady && supabase ? "supabase" : "local";
}

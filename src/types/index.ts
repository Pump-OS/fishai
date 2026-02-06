// ============================================================
// FishAI — Shared TypeScript Types
// ============================================================

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  wallet_address: string | null;
  is_pro: boolean;
  total_score: number;
  catch_count: number;
  created_at: string;
  updated_at: string;
}

export interface FishEvaluation {
  species_guess: string;
  confidence: number;
  estimated_weight_kg: number | null;
  estimated_length_cm: number | null;
  fish_score: number;
  reasoning_short: string;
  tips: string[];
  meme_line: string;
  disclaimers: string[];
}

export interface Catch {
  id: string;
  user_id: string;
  photo_url: string;
  photo_path: string | null;
  species_guess: string | null;
  confidence: number | null;
  estimated_weight_kg: number | null;
  estimated_length_cm: number | null;
  fish_score: number;
  reasoning_short: string | null;
  tips: string[] | null;
  meme_line: string | null;
  disclaimers: string[] | null;
  location_text: string | null;
  water_type: WaterType | null;
  gear_notes: string | null;
  caught_at: string;
  created_at: string;
  is_public: boolean;
  // Joined
  profiles?: Pick<Profile, "username" | "display_name" | "avatar_url">;
}

export type WaterType =
  | "lake"
  | "river"
  | "sea"
  | "pond"
  | "stream"
  | "ocean"
  | "other";

export interface GearLoadout {
  id: string;
  user_id: string;
  name: string;
  rod: string | null;
  reel: string | null;
  line_type: string | null;
  line_strength_lb: number | null;
  hook_type: string | null;
  hook_size: string | null;
  bait_or_lure: string | null;
  notes: string | null;
  loadout_score: number | null;
  ai_recommendation: string | null;
  target_species: string | null;
  water_type: WaterType | null;
  created_at: string;
  updated_at: string;
}

export interface TackleAdviceRequest {
  rod?: string;
  reel?: string;
  line_type?: string;
  line_strength_lb?: number;
  hook_type?: string;
  hook_size?: string;
  bait_or_lure?: string;
  target_species?: string;
  water_type?: WaterType;
  notes?: string;
}

export interface TackleAdviceResponse {
  loadout_score: number;
  summary: string;
  improvements: string[];
  meme_line: string;
  recommended_setup: {
    rod?: string;
    reel?: string;
    line?: string;
    hook?: string;
    bait?: string;
  };
}

export interface WeatherAdviceRequest {
  city: string;
  country?: string;
  water_type?: WaterType;
  target_species?: string;
}

export interface WeatherForecast {
  city: string;
  country: string;
  current: {
    temp_c: number;
    humidity: number;
    wind_speed_kmh: number;
    description: string;
    icon: string;
  };
  daily: Array<{
    date: string;
    temp_min_c: number;
    temp_max_c: number;
    description: string;
    icon: string;
    wind_speed_kmh: number;
    pop: number; // probability of precipitation
  }>;
}

export interface WeatherAdviceResponse {
  forecast: WeatherForecast;
  best_times: string[];
  recommended_bait: string[];
  recommended_depth: string;
  recommended_technique: string;
  reasoning: string;
  meme_line: string;
  disclaimers: string[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// AI Service — Claude API wrapper (isolated)
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import type {
  FishEvaluation,
  TackleAdviceRequest,
  TackleAdviceResponse,
  WeatherForecast,
  WeatherAdviceResponse,
} from "@/types";

const NPC_SYSTEM_PROMPT = `You are FishAI, a fishing advisor NPC from Rust (the game). You speak in short, punchy sentences with dry sarcasm and gamer humor. You're helpful but always memey. You reference survival game tropes. Never toxic, always funny. You know A LOT about fishing — species, tackle, techniques, weather patterns. You give real advice wrapped in NPC dialog flavor.

Key personality traits:
- Refer to the user as "survivor" or "nakeds" sometimes
- Use Rust game references naturally (e.g., "better loot than a military crate")
- Keep responses concise and structured
- Always include disclaimers for estimates
- Fish scores are 0-100 (100 = legendary catch)`;

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
}

// ─── Fish Photo Evaluation ───────────────────────────────────
export async function evaluateFishPhoto(
  imageBase64: string,
  mimeType: string,
  context?: { location?: string; water_type?: string; gear?: string }
): Promise<FishEvaluation> {
  const client = getClient();

  const contextStr = context
    ? `\nContext: Location: ${context.location || "unknown"}, Water: ${context.water_type || "unknown"}, Gear: ${context.gear || "unknown"}`
    : "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: NPC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `Evaluate this fish catch photo. ${contextStr}

Return ONLY valid JSON with this exact structure:
{
  "species_guess": "string — best guess species name",
  "confidence": 0.0-1.0,
  "estimated_weight_kg": number or null,
  "estimated_length_cm": number or null,
  "fish_score": 0-100,
  "reasoning_short": "1-2 sentence evaluation in NPC style",
  "tips": ["tip1", "tip2", "tip3"],
  "meme_line": "one funny NPC line about this catch",
  "disclaimers": ["disclaimer1"]
}`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseFishEvalJSON(text);
}

// Fallback: text-only evaluation (when vision not available)
export async function evaluateFishText(
  description: string,
  context?: { location?: string; water_type?: string; gear?: string }
): Promise<FishEvaluation> {
  const client = getClient();

  const contextStr = context
    ? `Context: Location: ${context.location || "unknown"}, Water: ${context.water_type || "unknown"}, Gear: ${context.gear || "unknown"}`
    : "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: NPC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `A survivor uploaded a fish photo. We couldn't process the image, but here's what they said: "${description}". ${contextStr}

Give your best NPC-style fish evaluation. Return ONLY valid JSON:
{
  "species_guess": "string",
  "confidence": 0.0-1.0,
  "estimated_weight_kg": number or null,
  "estimated_length_cm": number or null,
  "fish_score": 0-100,
  "reasoning_short": "1-2 sentences",
  "tips": ["tip1", "tip2", "tip3"],
  "meme_line": "funny NPC line",
  "disclaimers": ["No photo analysis — estimates are extra rough"]
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseFishEvalJSON(text);
}

function parseFishEvalJSON(text: string): FishEvaluation {
  // Extract JSON from possible markdown code blocks
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI returned no valid JSON");
  }
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    species_guess: parsed.species_guess || "Unknown species",
    confidence: Math.min(1, Math.max(0, parsed.confidence || 0)),
    estimated_weight_kg: parsed.estimated_weight_kg ?? null,
    estimated_length_cm: parsed.estimated_length_cm ?? null,
    fish_score: Math.min(100, Math.max(0, Math.round(parsed.fish_score || 0))),
    reasoning_short: parsed.reasoning_short || "The NPC stares blankly.",
    tips: Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5) : [],
    meme_line: parsed.meme_line || "...nice fish, I guess.",
    disclaimers: Array.isArray(parsed.disclaimers)
      ? parsed.disclaimers
      : ["AI estimates — take with a grain of salt (and lemon)."],
  };
}

// ─── Tackle Advice ───────────────────────────────────────────
export async function getTackleAdvice(
  loadout: TackleAdviceRequest
): Promise<TackleAdviceResponse> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: NPC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this fishing loadout and suggest improvements:
${JSON.stringify(loadout, null, 2)}

Return ONLY valid JSON:
{
  "loadout_score": 0-100,
  "summary": "brief NPC-style summary",
  "improvements": ["improvement1", "improvement2"],
  "meme_line": "funny NPC line",
  "recommended_setup": {
    "rod": "string or null",
    "reel": "string or null",
    "line": "string or null",
    "hook": "string or null",
    "bait": "string or null"
  }
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned no valid JSON");
  return JSON.parse(jsonMatch[0]) as TackleAdviceResponse;
}

// ─── Weather + Fishing Advice ────────────────────────────────
export async function getWeatherFishingAdvice(
  forecast: WeatherForecast,
  waterType?: string,
  targetSpecies?: string
): Promise<Omit<WeatherAdviceResponse, "forecast">> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: NPC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Based on this weather forecast for ${forecast.city}, ${forecast.country}:
${JSON.stringify(forecast, null, 2)}

Water type: ${waterType || "unknown"}
Target species: ${targetSpecies || "anything that bites"}

Give fishing advice. Return ONLY valid JSON:
{
  "best_times": ["time1", "time2"],
  "recommended_bait": ["bait1", "bait2"],
  "recommended_depth": "string",
  "recommended_technique": "string",
  "reasoning": "2-3 sentence NPC-style reasoning",
  "meme_line": "funny NPC line about the weather/fishing",
  "disclaimers": ["disclaimer about accuracy"]
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned no valid JSON");
  return JSON.parse(jsonMatch[0]);
}

// ─── NPC Chat ────────────────────────────────────────────────
export async function chatWithNPC(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userContext?: { catches?: number; bestScore?: number; gear?: string }
): Promise<string> {
  const client = getClient();

  const contextAddition = userContext
    ? `\n\nUser stats: ${userContext.catches || 0} catches, best score: ${userContext.bestScore || 0}, favorite gear: ${userContext.gear || "unknown"}`
    : "";

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: NPC_SYSTEM_PROMPT + contextAddition,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "...the NPC stares at you, confused.";
}

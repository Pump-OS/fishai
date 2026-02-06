import { NextRequest, NextResponse } from "next/server";
import { getWeatherFishingAdvice } from "@/services/ai";
import { getWeatherForecast } from "@/services/weather";
import { weatherAdviceSchema } from "@/lib/validators/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/services/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = checkRateLimit(ip, "weather-advice");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit hit. Even weather APIs need rest." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parsed = weatherAdviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Fetch weather data
    const forecast = await getWeatherForecast(
      parsed.data.city,
      parsed.data.country
    );

    // Get AI fishing advice based on weather
    const advice = await getWeatherFishingAdvice(
      forecast,
      parsed.data.water_type,
      parsed.data.target_species
    );

    return NextResponse.json(
      { forecast, ...advice },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (err) {
    console.error("Weather advice error:", err);
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

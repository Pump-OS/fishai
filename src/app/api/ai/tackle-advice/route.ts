import { NextRequest, NextResponse } from "next/server";
import { getTackleAdvice } from "@/services/ai";
import { tackleAdviceSchema } from "@/lib/validators/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/services/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = checkRateLimit(ip, "tackle-advice");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded, survivor. Cool down." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parsed = tackleAdviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const advice = await getTackleAdvice(parsed.data);

    return NextResponse.json(
      { advice },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (err) {
    console.error("Tackle advice error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { evaluateFishPhoto, evaluateFishText } from "@/services/ai";
import { checkRateLimit, getRateLimitHeaders } from "@/services/rate-limit";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = checkRateLimit(ip, "evaluate-fish");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. The NPC needs a break, survivor." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const formData = await request.formData();
    const photo = formData.get("photo") as File | null;
    const locationText = formData.get("location_text") as string | null;
    const waterType = formData.get("water_type") as string | null;
    const gearNotes = formData.get("gear_notes") as string | null;

    if (!photo) {
      return NextResponse.json(
        { error: "No photo provided. The NPC can't evaluate thin air." },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Invalid image type. JPG, PNG, WebP, or GIF only." },
        { status: 400 }
      );
    }

    // Max 10MB
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image too large. Max 10MB. This isn't a RAW photo contest." },
        { status: 400 }
      );
    }

    // AI evaluation (no upload to storage, no DB save)
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const base64 = photoBuffer.toString("base64");
    const context = {
      location: locationText || undefined,
      water_type: waterType || undefined,
      gear: gearNotes || undefined,
    };

    let evaluation;
    try {
      evaluation = await evaluateFishPhoto(base64, photo.type, context);
    } catch {
      // Fallback to text-only if vision fails
      evaluation = await evaluateFishText(
        `Fish photo uploaded. Filename: ${photo.name}`,
        context
      );
    }

    // Return evaluation directly (no DB)
    const result = {
      id: `catch-${Date.now()}`,
      user_id: "guest",
      photo_url: "",
      photo_path: null,
      species_guess: evaluation.species_guess,
      confidence: evaluation.confidence,
      estimated_weight_kg: evaluation.estimated_weight_kg,
      estimated_length_cm: evaluation.estimated_length_cm,
      fish_score: evaluation.fish_score,
      reasoning_short: evaluation.reasoning_short,
      tips: evaluation.tips,
      meme_line: evaluation.meme_line,
      disclaimers: evaluation.disclaimers,
      location_text: locationText,
      water_type: waterType,
      gear_notes: gearNotes,
      caught_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_public: true,
    };

    return NextResponse.json(
      { catch: result, evaluation },
      { status: 201, headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (err) {
    console.error("Evaluate fish error:", err);
    return NextResponse.json(
      { error: "Internal server error. The NPC crashed." },
      { status: 500 }
    );
  }
}


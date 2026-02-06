import { NextRequest, NextResponse } from "next/server";
import { chatWithNPC } from "@/services/ai";
import { chatMessageSchema } from "@/lib/validators/schemas";
import { checkRateLimit, getRateLimitHeaders } from "@/services/rate-limit";

// In-memory chat history (per session, resets on server restart)
const chatSessions = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>();

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimitResult = checkRateLimit(ip, "chat");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Slow down, survivor. The NPC has a cooldown." },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Use provided session_id or create a new one
    let sessionId = parsed.data.session_id || `session-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Get or create in-memory chat history
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }
    const history = chatSessions.get(sessionId)!;

    // Add user message to history
    history.push({ role: "user", content: parsed.data.content });

    // Keep only last 20 messages for context
    const recentMessages = history.slice(-20);

    const npcResponse = await chatWithNPC(recentMessages, {
      catches: 0,
      bestScore: 0,
    });

    // Save assistant response to history
    history.push({ role: "assistant", content: npcResponse });

    // Clean up old sessions (keep max 100)
    if (chatSessions.size > 100) {
      const oldestKey = chatSessions.keys().next().value;
      if (oldestKey) chatSessions.delete(oldestKey);
    }

    return NextResponse.json(
      {
        session_id: sessionId,
        message: npcResponse,
      },
      { headers: getRateLimitHeaders(rateLimitResult) }
    );
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "The NPC is offline. Try again later." },
      { status: 500 }
    );
  }
}

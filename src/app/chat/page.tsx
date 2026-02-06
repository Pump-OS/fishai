"use client";

import { useState, useRef, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial NPC greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content:
            "Yo, survivor. Welcome to the fishing shack. Ask me anything about fishing — species, gear, techniques, or just tell me about your latest catch. I've seen some things out there on the water. What's on your mind?",
        },
      ]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId || undefined,
          content: userMsg.content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: data.error || "...the NPC went AFK. Try again.",
          },
        ]);
        return;
      }

      if (data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          id: `npc-${Date.now()}`,
          role: "assistant",
          content: data.message,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Connection lost. The NPC is checking the server room.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col" style={{ height: "calc(100vh - 10rem)" }}>
      <div className="text-center mb-4">
        <h1 className="font-game text-lg text-[#c8b06a]">Fisherman NPC</h1>
        <p className="text-xs text-[#666]">
          Talk to the Fisherman. He knows things.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 mb-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            {msg.role === "assistant" ? (
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ background: "rgba(60, 55, 45, 0.9)", border: "1px solid rgba(200, 176, 106, 0.3)" }}>
                <img src="/images/fish-logo.png" alt="NPC" className="w-7 h-auto" />
              </div>
            ) : (
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-xs font-bold text-white" style={{ background: "rgba(140, 80, 40, 0.7)", border: "1px solid rgba(140, 80, 40, 0.4)" }}>
                A
              </div>
            )}

            {/* Message bubble */}
            <div className={`max-w-[80%]`}>
              {/* Name label */}
              <p className={`text-[10px] uppercase tracking-widest mb-1 ${msg.role === "user" ? "text-right text-[#886640]" : "text-[#8a7d5a]"}`}>
                {msg.role === "assistant" ? "Fisherman" : "You"}
              </p>
              <div
                className={`px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "text-[#ccc]"
                    : "npc-quote"
                }`}
                style={msg.role === "user" ? { background: "rgba(100, 60, 30, 0.25)", border: "1px solid rgba(140, 80, 40, 0.3)" } : {}}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ background: "rgba(60, 55, 45, 0.9)", border: "1px solid rgba(200, 176, 106, 0.3)" }}>
              <img src="/images/fish-logo.png" alt="NPC" className="w-7 h-auto" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest mb-1 text-[#8a7d5a]">Fisherman</p>
              <div className="npc-quote">
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-xs text-[#666]">typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — always visible, no auth required */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Fisherman anything about fishing..."
          className="input-rust flex-1"
          disabled={loading}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="btn-rust !px-6 flex-shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}

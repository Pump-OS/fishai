import { createServerSupabase } from "@/lib/supabase/server";
import type { Catch } from "@/types";
import FishResultCard from "@/components/catch/FishResultCard";
import ShareableCardWrapper from "./ShareableCardWrapper";

export default async function CatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let data = null;
  try {
    const supabase = await createServerSupabase();
    const { data: d } = await supabase
      .from("catches")
      .select("*, profiles(username, display_name, avatar_url)")
      .eq("id", id)
      .single();
    data = d;
  } catch {
    // Supabase not configured
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="npc-quote">
          <p className="text-npc-text">
            Catch not found. It probably despawned.
          </p>
        </div>
      </div>
    );
  }

  const catchData = data as Catch;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Angler info */}
      {catchData.profiles && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rust-600 flex items-center justify-center text-sm">
            {catchData.profiles.display_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <a
              href={`/profile/${catchData.user_id}`}
              className="text-sm font-bold text-npc-text hover:text-npc-accent transition-colors"
            >
              {catchData.profiles.display_name || "Anonymous"}
            </a>
            {catchData.profiles.username && (
              <p className="text-xs text-npc-text/30">
                @{catchData.profiles.username}
              </p>
            )}
          </div>
        </div>
      )}

      <FishResultCard data={catchData} />

      <div className="mt-8">
        <h3 className="text-sm font-bold text-npc-accent mb-4 text-center">
          Share this catch
        </h3>
        <ShareableCardWrapper data={catchData} />
      </div>
    </div>
  );
}

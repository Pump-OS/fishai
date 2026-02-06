import { createServerSupabase } from "@/lib/supabase/server";
import type { Profile, Catch } from "@/types";
import Badge from "@/components/ui/Badge";
import { relativeTime } from "@/lib/utils";

function getScoreClass(score: number): string {
  if (score >= 90) return "score-legendary";
  if (score >= 70) return "score-epic";
  if (score >= 50) return "score-rare";
  return "score-common";
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let profile = null;
  let catches = null;
  try {
    const supabase = await createServerSupabase();
    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    profile = p;
    if (profile) {
      const { data: c } = await supabase
        .from("catches")
        .select("*")
        .eq("user_id", id)
        .eq("is_public", true)
        .order("fish_score", { ascending: false })
        .limit(20);
      catches = c;
    }
  } catch {
    // Supabase not configured
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="npc-quote">
          <p className="text-npc-text">
            This survivor doesn&apos;t exist. Maybe they got raided.
          </p>
        </div>
      </div>
    );
  }

  const typedProfile = profile as Profile;
  const typedCatches = (catches || []) as Catch[];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="rust-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-rust-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {typedProfile.display_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <h1 className="text-2xl font-bold text-npc-text">
                {typedProfile.display_name || "Anonymous Angler"}
              </h1>
              {typedProfile.is_pro && <Badge variant="pro">PRO</Badge>}
            </div>
            {typedProfile.username && (
              <p className="text-sm text-npc-text/40 mb-2">
                @{typedProfile.username}
              </p>
            )}
            {typedProfile.bio && (
              <p className="text-sm text-npc-text/60 mb-4">{typedProfile.bio}</p>
            )}
            <div className="flex gap-6 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-2xl font-bold text-npc-accent">
                  {typedProfile.catch_count}
                </p>
                <p className="text-xs text-npc-text/40">Catches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-npc-accent">
                  {typedProfile.total_score}
                </p>
                <p className="text-xs text-npc-text/40">Total Score</p>
              </div>
              {typedProfile.wallet_address && (
                <div className="text-center">
                  <p className="text-sm text-npc-text/50 font-mono">
                    {typedProfile.wallet_address.slice(0, 4)}...
                    {typedProfile.wallet_address.slice(-4)}
                  </p>
                  <p className="text-xs text-npc-text/40">Wallet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catches grid */}
      <h2 className="font-game text-sm text-npc-accent mb-4">
        Catches ({typedCatches.length})
      </h2>

      {typedCatches.length === 0 ? (
        <div className="npc-quote text-center">
          <p className="text-npc-text">
            No catches yet. This survivor is all talk, no fish.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {typedCatches.map((c) => (
            <a
              key={c.id}
              href={`/catch/${c.id}`}
              className="rust-card overflow-hidden group hover:border-npc-accent/50 transition-all"
            >
              <img
                src={c.photo_url}
                alt={c.species_guess || "Catch"}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
              />
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-npc-text truncate">
                    {c.species_guess || "Unknown"}
                  </p>
                  <span
                    className={`font-game text-xs ${getScoreClass(c.fish_score)}`}
                  >
                    {c.fish_score}
                  </span>
                </div>
                <p className="text-xs text-npc-text/30">
                  {relativeTime(c.created_at)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <div className="inline-block mb-6">
          <img
            src="/images/fish-logo.png"
            alt="FishAI"
            className="w-64 h-auto animate-float inline-block drop-shadow-[0_0_20px_rgba(200,176,106,0.2)]"
          />
        </div>
        <h1 className="font-game text-2xl sm:text-3xl md:text-4xl text-[#c8b06a] mb-4 leading-relaxed">
          FishAI
        </h1>
        <p className="text-lg sm:text-xl text-[#999] max-w-2xl mx-auto mb-2">
          Your AI fishing companion.
        </p>
        <p className="text-sm text-[#666] mb-8">
          Upload catches / Get scored / Talk to the Fisherman
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/catch" className="btn-rust text-base">
            Upload a Catch
          </a>
          <a href="/chat" className="btn-rust-outline text-base">
            Talk to the Fisherman
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        <FeatureCard
          title="Fish Scanner"
          description="Upload a photo. The NPC identifies the species, estimates weight, and gives a Fish Score."
          href="/catch"
          tag="CORE"
        />
        <FeatureCard
          title="Tackle Advisor"
          description="Enter your rod, reel, and line setup. Get a Loadout Score and NPC recommendations."
          href="/tackle"
          tag="GEAR"
        />
        <FeatureCard
          title="Weather & Forecast"
          description="Pick your region. The NPC checks weather and tells you when, where, and how to fish."
          href="/weather"
          tag="FORECAST"
        />
        <FeatureCard
          title="Tackle Calculator"
          description="Line strength vs fish weight, hook size guides, lure weight ranges."
          href="/tackle#calculator"
          tag="TOOLS"
        />
        <FeatureCard
          title="Fisherman NPC"
          description="Chat with the Fisherman. Ask anything about fishing. Dry humor included."
          href="/chat"
          tag="CHAT"
        />
      </section>

      {/* NPC Quote — Rust game dialog style */}
      <section className="max-w-2xl mx-auto">
        <div className="npc-dialog">
          <div className="npc-dialog-close">X</div>
          <div className="npc-dialog-header">Fisherman</div>
          <div className="npc-dialog-body">
            Welcome to the fishing village. Upload your catch or check the weather.
            I can help with tackle, scoring, and telling you what you did wrong.
          </div>
          <div className="npc-dialog-options">
            <a href="/catch" className="npc-dialog-option">
              <span className="npc-dialog-option-num">1</span>
              Upload a catch
            </a>
            <a href="/weather" className="npc-dialog-option">
              <span className="npc-dialog-option-num">2</span>
              Check the forecast
            </a>
            <a href="/chat" className="npc-dialog-option">
              <span className="npc-dialog-option-num">3</span>
              Talk to me
            </a>
            <div className="npc-dialog-option text-[#888]">
              <span className="npc-dialog-option-num">4</span>
              [EXIT]
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  href,
  tag,
}: {
  title: string;
  description: string;
  href: string;
  tag: string;
}) {
  return (
    <a href={href} className="rust-card group hover:border-[rgba(140,125,90,0.5)] transition-all cursor-pointer">
      <div className="relative z-10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#ddd] uppercase tracking-wide group-hover:text-white transition-colors">
            {title}
          </h3>
          <span className="text-[9px] font-game text-[#6b5c3e] tracking-widest">
            {tag}
          </span>
        </div>
        <p className="text-xs text-[#999] leading-relaxed">{description}</p>
      </div>
    </a>
  );
}

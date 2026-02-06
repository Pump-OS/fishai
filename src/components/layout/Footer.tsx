export default function Footer() {
  return (
    <footer className="border-t border-rust-700/20 mt-auto bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-npc-text/40">
        <div className="flex items-center gap-2">
          <img src="/images/fish-logo.png" alt="FishAI" className="w-12 h-auto" />
          <span className="font-game text-xs">FishAI</span>
          <span>- good fishing advice.</span>
        </div>
        <span className="hidden sm:inline text-npc-text/20">|</span>
        <span className="text-xs text-npc-text/30">Powered by Claude</span>
      </div>
    </footer>
  );
}

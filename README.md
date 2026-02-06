# FishAI — Rust Fishing Village Advisor

AI-powered fishing assistant with Rust NPC energy. Upload catches, get scored, compete on the leaderboard.

## Features

- **Fish Scanner** — Upload a photo, AI identifies species, estimates weight, gives a Fish Score
- **Tackle Advisor** — Enter your gear setup, get a Loadout Score and NPC-roasted improvements
- **Weather Forecast** — Pick your region, get fishing-specific weather intelligence
- **Tackle Calculator** — Line strength, hook size, lure weight quick math
- **Leaderboard** — Global rankings by fish score
- **NPC Chat** — Talk to the Rust fishing NPC for advice with dry humor
- **Wallet Connect** — Phantom wallet integration for token-gated Pro features

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom Rust-themed design system)
- **Supabase** (Auth, Postgres, Storage)
- **Claude API** (AI fish evaluation, advice, chat)
- **OpenWeather API** (weather forecasts)
- **Solana** (read-only wallet connect + token gating)
- **Zod** (validation)

## Getting Started

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up Supabase:
   - Create a new project at supabase.com
   - Run `supabase/schema.sql` in the SQL editor
   - Create a storage bucket named `catches` (public)
   - Enable Email/Magic Link auth and Google/Discord OAuth
5. Run the dev server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint |
| `NEXT_PUBLIC_FISHAI_TOKEN_MINT` | $FISHAI token mint address |
| `RATE_LIMIT_AI_PER_MINUTE` | AI endpoint rate limit (default: 10) |

## Project Structure

```
src/
├── app/          # Next.js App Router pages & API routes
├── components/   # React components (ui, layout, feature-specific)
├── hooks/        # Custom React hooks (auth, music, wallet)
├── lib/          # Utilities, Supabase clients, validators
├── services/     # Isolated external API wrappers (AI, weather, storage, solana)
└── types/        # Shared TypeScript types
```

## Disclaimers

- AI species identification and weight estimates are approximate
- Weather-based fishing advice is for fun and general guidance
- No financial advice is provided — token features are cosmetic only
- Fish scores are meaningless but fun

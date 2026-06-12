# LaughRoyale

A real-time multiplayer party game where players compete to make each other laugh using celebrity quotes. Laughter intensity is measured through the microphone.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `DATABASE_URL` — Postgres connection string (if using DB features)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, React Native, Expo Router
- Backend: Express 5 (api-server artifact)
- DB: PostgreSQL + Drizzle ORM (not yet connected to game — game state uses AsyncStorage)
- Validation: Zod
- Audio: expo-av (microphone laughter detection)
- Storage: @react-native-async-storage/async-storage

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/` — Expo Router screens (file-based routing)
- `artifacts/mobile/context/` — AuthContext, GameContext, SubscriptionContext
- `artifacts/mobile/data/celebrities.ts` — Celebrity database with quotes
- `artifacts/mobile/hooks/useAudioLevel.ts` — Microphone audio level hook
- `artifacts/mobile/components/` — TimerRing, AudioMeter, PlayerCard
- `artifacts/api-server/` — Express API server
- `lib/api-spec/openapi.yaml` — API spec

## Architecture decisions

- Game state stored in AsyncStorage (no backend required for gameplay — all local)
- Auth is local (AsyncStorage) — no Supabase/Firebase in current build
- Microphone uses expo-av with fallback to simulation on web/permission denied
- Subscription is mocked (UI complete, RevenueCat integration is next step)
- Dark-first design with purple/gold party game palette

## Product

- Players create or join a game session with a 6-character code
- Each player is assigned an Egyptian or international celebrity with quotes
- Turn-based gameplay: 60s per turn, read quotes in celebrity's voice to make others laugh
- Microphone measures laughter intensity in real-time
- Score = average audio level during turn
- Results screen shows winner with animated podium
- 3-day free trial, then subscription ($15/wk, $39/mo, $199/yr)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- expo-av version: installed 15.0.2 but Expo SDK 54 expects ~16.0.8 — upgrade when testing on device
- expo-secure-store version: installed 14.0.1, expected ~15.0.8 — same
- Audio simulation used on web and when mic permission is denied
- Game runs on a single device passed between players in same room

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Celebrity quotes are in `artifacts/mobile/data/celebrities.ts`

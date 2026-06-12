---
name: Theme System
description: LaughRoyale light/dark/system theme implementation — decisions, token mapping, and gotchas
---

## Architecture

- `context/ThemeContext.tsx` — `ThemeProvider` wraps the entire app in `_layout.tsx`. Stores `"light" | "dark" | "system"` in AsyncStorage (`lr_theme_preference` key). Defaults to `"dark"` to match original app feel.
- `hooks/useColors.ts` — reads `resolved` from `ThemeContext` and returns `colors.light` or `colors.dark` palette from `constants/colors.ts`.
- `ThemeSync` component (inside `_layout.tsx` but within `ThemeProvider`) — updates `SystemUI.setBackgroundColorAsync` reactively when theme changes.
- Profile screen has a 3-segment toggle: Light / Auto / Dark.

## Token mapping (dark hardcodes → tokens)

| Hardcoded | Token |
|-----------|-------|
| `#0D0B1E` | `colors.background` |
| `#1A1635` | `colors.card` |
| `#2D2A4A` | `colors.muted` (bg) / `colors.border` (borders) |
| `#3D3A6A` | `colors.border` |
| `#F8F7FF` | `colors.foreground` |
| `#9B99B8` | `colors.mutedForeground` |
| `#6B6880` | `colors.mutedForeground` |
| `LinearGradient ["#0D0B1E","#1A0F3C","#0D0B1E"]` | `colors.gradientBg` |
| `LinearGradient ["#0D0B1E","#1A0F3C"]` | `colors.gradientBg2` |

## Gradient tokens added to colors.ts

- `gradientBg: ["F5F3FF","EDE9FE","F5F3FF"]` (light) / `["0D0B1E","1A0F3C","0D0B1E"]` (dark) — typed as `[string, string, string]`
- `gradientBg2: ["F5F3FF","EDE9FE"]` / `["0D0B1E","1A0F3C"]` — typed as `[string, string]`

**Why:** LinearGradient `colors` prop needs a tuple type, `as const` causes readonly issues, so explicit tuple type annotations used.

## Screens covered

All screens now use theme tokens — no hardcoded dark colors remain:
`login.tsx`, `register.tsx`, `(tabs)/profile.tsx`, `(tabs)/_layout.tsx`, `game/[id].tsx`, `results/[id].tsx`, `subscription.tsx`, `lobby/[id].tsx`, `create-session.tsx`, `join-session.tsx`.

Components `PlayerCard`, `AudioMeter`, `TimerRing` already used `useColors` correctly.

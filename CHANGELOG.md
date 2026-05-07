# Homefarm Shop Simulator Log

Single source of truth for the project snapshot, feature map, and version history.

## Current Snapshot

- Current version: `v3.1`
- Current commit: TBD
- Current rollback tag: `v3.1-tutorial-redesign`
- Main route: `/homefarm-shop-simulator`
- Rollback rule: use the tag that matches the version you want to restore

## Project Structure

```txt
CHANGELOG.md
README.md
package.json
package-lock.json
next.config.ts
tsconfig.json
eslint.config.mjs
postcss.config.mjs
next-env.d.ts

src/
  app/
    globals.css
    layout.tsx
    page.tsx
    homefarm-shop-simulator/page.tsx
  components/
    homefarm-shop/
      HomefarmShopGame.tsx
      EndDaySummary.tsx
      homefarm-shop.css
  config/
    version.ts
  lib/
    supabaseClient.ts
    homefarm-shop/
      data.ts
      gameUtils.ts
      leaderboard.ts
      customerTypes.extra.ts
  types/
    homefarm-shop.ts

public/homefarm-shop/
  ASSETS_NOTE.txt
  header-brand.png
  homefarm-shop-simulator-logo.png
  mascot/*.webp

scripts/
  optimize-mascot.js

supabase/
  homefarm_shop_leaderboard.sql
```

## Core Features

- Standalone game route rendered from the root app shell.
- Day-based shop loop with customer queue, order selection, delivery, and next-day progression.
- Dynamic product unlocks as days advance.
- Import stock modal with cost checks.
- Fillet flow for whole salmon into fillet and head-bone stock.
- Order states, patience, mood, combo, tip, and profit tracking.
- VIP customers with larger orders and higher tip potential.
- App orders with shipping fee deduction.
- Rainy-day behavior that increases app-order frequency.
- Special events starting from Day 12.
- Product catalog expansion unlock at Day 6.
- Shop upgrade system unlock at Day 8.
- End-of-day summary modal.
- Overnight stock spoilage with freezer mitigation.
- Leaderboard support with local/Supabase mode.
- Version badge visible in the game UI.

## Version History

### v3.1 - Tutorial redesign with player name

- Replaced tutorial modal with full-screen image-based design (tutorial-bg.jpg + tutorial-btn.png).
- Added player name input field overlaid on the design at the correct position.
- Button is greyed out until a name is entered; confirms and starts the game.
- Player name is kept in session memory only, used when saving to the leaderboard.
- Updated the visible game version badge to `v3.1`.
- Tag: `v3.1-tutorial-redesign`

### v3.0 - Start screen & tutorial

- Added a start screen filling the phone frame with farm-themed green background, game logo, mascot, and tag labels.
- Added a START GAME button that leads to a tutorial popup before entering gameplay.
- Added a tutorial popup with 4 feature bullets: order management, customer service, revenue optimization, and shop upgrades.
- Credits on start screen: ý tưởng Tada, vibe code với Codex và Claude Code.
- Game timers no longer run during start/tutorial phase.
- Updated the visible game version badge to `v3.0`.
- Tag: `v3.0-start-screen`

### v2.6 - Supabase leaderboard

- Connected leaderboard to Supabase for persistent cloud storage across sessions.
- Created `homefarm_shop_leaderboard` table with RLS policies (public read, public insert with validation).
- Fallback to localStorage when Supabase env vars are not set.
- Updated the visible game version badge to `v2.6`.
- Tag: `v2.6-supabase-leaderboard`

### v2.5 - Overnight stock spoilage

- Added overnight stock spoilage when advancing to the next day.
- Applied spoilage before newly unlocked products are added, so new catalog items do not decay immediately.
- Made seafood and meat decay faster than fruit, core, and addon products.
- Made freezer upgrades reduce overnight spoilage by 25% per level, capped at 75%.
- Added a toast note when overnight spoilage affects stocked products.
- Updated the visible game version badge to `v2.5`.
- Tag: `v2.5-overnight-stock-spoilage`

### v2.4.4 - Later special events

- Moved special events to start from Day 12 instead of Day 6.
- Added an operations warning modal when the player advances from Day 11 to Day 12.
- Changed special event chance to start at 18% on Day 12, increase by 2% per day, and cap at 36%.
- Paused the customer timer while the Day 12 warning modal is open.
- Updated the visible game version badge to `v2.4.4`.
- Tag: `v2.4.4-day12-special-events`

### v2.4.3 - Rainy day app orders

- Added app-order tracking with an `APP` badge in the active order card.
- Added a 20k shipping fee deduction from cash and profit for every delivered app order.
- Made rainy-day events actually increase app-order frequency by favoring `Shipper app` customers and converting some normal orders to app orders.
- Updated the visible game version badge to `v2.4.3`.
- Tag: `v2.4.3-rainy-day-app-fees`

### v2.4.2 - Day 6 product expansion unlock

- Added a product catalog expansion modal when the player advances from Day 5 to Day 6.
- Kept existing gameplay controls hidden while the unlock modal is open.
- Added a toast note when Day 6 starts and the product catalog expands.
- Updated the visible game version badge to `v2.4.2`.
- Tag: `v2.4.2-day6-catalog-unlock`

### v2.4.1 - Day 8 upgrade unlock

- Hidden the shop upgrade button before Day 8.
- Added a feature-unlock modal when the player advances from Day 7 to Day 8.
- Paused the customer timer while the unlock modal is open.
- Updated the visible game version badge to `v2.4.1`.
- Tag: `v2.4.1-day8-upgrade-unlock`

### v2.4 - Shop upgrades

- Added a shop upgrade modal with four upgrades: fillet knife, staff helper, VIP sign, and freezer.
- Added upgrade levels and cash costs with a max level of 3 per upgrade.
- Made fillet knife upgrades increase salmon and head-bone yield immediately.
- Made staff helper upgrades increase customer patience from the next day.
- Made VIP sign upgrades increase VIP customer chance from the next day.
- Made freezer upgrades reduce negative stock loss from shop events.
- Updated the visible game version badge to `v2.4`.
- Tag: `v2.4-shop-upgrades`

### v2.3.1 - Remove daily goal overlay

- Removed the daily goal bar from the active order panel so `ORDER`, `TIME`, and `MOOD` remain clearly visible.
- Removed daily goal reward logic from day transitions.
- Kept the end-day summary and VIP customer behavior from `v2.3`.
- Updated the visible game version badge to `v2.3.1`.
- Tag: `v2.3.1-no-daily-goals`

### v2.3 - Daily goals, end-day summary, VIP orders

- Added a real end-day summary modal with revenue, profit, served customers, skipped customers, max combo, rating, and goal result.
- Added rotating daily goals for revenue, served customers, and max combo.
- Added cash rewards for completed daily goals when advancing to the next day.
- Added VIP customers from day 3 onward with larger orders, lower patience, a visible VIP badge, and higher tip potential.
- Added per-day served/skipped/max-combo tracking for fair summary and goal scoring.
- Updated the visible game version badge to `v2.3`.
- Tag: `v2.3-daily-goals-vip`

### v2.2.1 - Production build restore

- Restored the missing game component path needed for production builds.
- Tag: `v2.2.1-build-fix`

### v2.2 - End-day summary groundwork

- Added initial end-day summary and customer type groundwork.
- Added game version configuration.

### v2.1 - Difficulty and events

- Restored scaling difficulty.
- Restored shop event behavior.
- Tag: `v2.1-difficulty-events`

### v2.0 - Clean standalone simulator

- Cleaned the standalone Homefarm Simulator root version.
- Tag: `homefarm-simulator-clean-v2`

## Update Rule

- Append new versions at the top of `Version History`.
- Keep the current snapshot section in sync with the latest commit/tag.
- If a version changes UI/logic, update the relevant feature bullets and tag name here in the same commit.

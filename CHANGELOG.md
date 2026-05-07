# Homefarm Shop Simulator Log

Single source of truth for the project snapshot, feature map, and version history.

## Current Snapshot

- Current version: `v3.20`
- Current commit: TBD
- Current rollback tag: `v3.20-bot-no-save`
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

### v3.20 - Bot không lưu leaderboard

- Tên Tadadev bị chặn hoàn toàn khỏi `saveScore()` — không ghi điểm vào leaderboard dù thủ công hay auto.
- Tag: `v3.20-bot-no-save`

### v3.19 - Bot tự chơi (Tadadev mode)

- Nhập tên **Tadadev** ở màn tutorial để kích hoạt bot tự chơi.
- Bot tự động: chọn món → giao hàng → bỏ qua khách thiếu hàng → hết hàng thì auto nhập → qua ngày → dismiss mọi modal.
- Game over: bot tự restart sau 3 giây.
- Badge 🤖 BOT hiện ở góc trên trái khi bot đang chạy.
- Bot chạy vô tận để test toàn bộ flow, events, unlock theo ngày.
- Tag: `v3.19-bot`

### v3.18 - Ad unlock modal chi tiết

- Cải thiện modal thông báo mở khóa quảng cáo ở ngày 15: hiển thị bảng chi phí và số khách tăng cho từng loại.
- Thêm hướng dẫn "Nhấn nút 📣 Ads trên kệ hàng để chạy".
- Nút "Chạy ngay thôi!" mở thẳng vào modal quảng cáo.
- Tag: `v3.18-ad-unlock-modal`

### v3.17 - Hệ thống quảng cáo

- Mở khóa từ Day 15 với modal thông báo riêng.
- Hai loại quảng cáo: Phát tờ rơi (150k–500k, +3–5 khách) và Facebook Ads (350k–800k, +4–6 khách).
- Chi phí random trong khoảng, số khách thêm random và được áp dụng vào ngày hôm sau.
- Mỗi ngày chỉ chạy được 1 loại. Nút 📣 Ads trên shelf, đổi màu xanh khi đã chạy.
- Timer dừng khi mở modal ads.
- Tag: `v3.17-advertising`

### v3.16 - Start button nudge right +5%

- Thêm `translateX(5%)` để bù trừ padding trong suốt không đều trong file start-btn.png.
- Tag: `v3.16-start-btn-nudge`

### v3.15 - Fix start button centering (flex approach)

- Đổi `.hfs-start-screen` thành flex container (`align-items: center; justify-content: flex-end`) để căn nút Start Game chính giữa một cách đáng tin cậy.
- Bỏ `position: absolute` khỏi nút, dùng flex layout thay thế.
- Tag: `v3.15-start-btn-flex`

### v3.14 - Fix start button centering

- Đổi căn giữa nút Start Game từ `left:50%+translateX(-50%)` sang `left:0;right:0;margin:auto` cho chắc chắn hơn trên mọi device.
- Tag: `v3.14-start-btn-center`

### v3.13 - Mood pressure +50%

- Tăng tốc độ giảm mood thêm ×1.5 (từ ×1.69 lên ×2.535 so với gốc).
- Tag: `v3.13-mood-pressure2`

### v3.12 - Mood pressure +30%

- Tăng tốc độ giảm mood thêm ×1.3 (từ ×1.3 lên ×1.69 so với gốc).
- Tag: `v3.12-mood-pressure`

### v3.11 - SFX polish + tutorial UI

- Thêm âm thanh cho nút "Sang ngày X" trong màn tổng kết.
- Thêm âm thanh cho nút Fillet (knife "xẹt xẹt"), mở Nhập hàng, Qua ngày, stepper +/−.
- Tăng volume toàn bộ SFX lên ~2x so với v3.10.
- Tutorial: thêm dòng gợi ý âm thanh (khung amber).
- Tutorial: căn giữa toàn bộ header (title, desc).
- Tutorial: thêm icon 🏪 bên phải để cân layout.
- Tag: `v3.11-sfx-polish`

### v3.10 - Sound effects (Web Audio API)

- Added synthesized SFX via Web Audio API — zero new asset files.
- `sfx.tap()`: pop ngắn khi chọn đúng món.
- `sfx.wrong()`: buzz thấp khi tap sai, thiếu hàng.
- `sfx.deliver()`: ka-ching 3 nốt khi giao hàng thành công.
- `sfx.combo(level)`: fanfare tăng dần (3→5 nốt) khi combo 3+.
- `sfx.fail()`: tone buồn đi xuống khi khách bỏ đi.
- `sfx.cash()`: 2 nốt triangle khi nhập hàng / nâng cấp thành công.
- `sfx.gameOver()`: 4 nốt sawtooth đi xuống khi game over.
- SFX tự động tắt theo nút mute 🔇.
- Tag: `v3.10-sfx`

### v3.9 - Game over overhaul + mood pressure

- Added 2 new game over conditions:
  - **Bị trộm phá sản**: nếu sau khi trả vận hành, event thief đẩy tiền mặt xuống âm → phá sản ngay.
  - **Mất uy tín**: rating dưới 2.0 sao 3 ngày liên tiếp → cửa hàng mất khách, game over với màn riêng (icon 📉).
- Game over panel redesigned: icon, tiêu đề, mô tả lý do cụ thể, stats grid (ngày, DT, lãi, phục vụ, combo, điểm), hai nút 🏆 Leaderboard + 🔄 Chơi lại.
- Nút "Chơi lại" reset toàn bộ trạng thái về start screen (bao gồm BGM).
- Tăng tốc độ giảm mood ×1.3 để tạo áp lực cao hơn.
- Tag: `v3.9-gameover`

### v3.8 - Operating cost breakdown

- Split the daily operating cost into four named line items: Thuê nhà, Nhân viên, Điện nước, and Khác.
- "Khác" is randomised each day within a per-tier range (rounded to 10k): 10-50k for Day 1-5, 30-80k for Day 6-11, 50-150k for Day 12+.
- End-day summary shows each line item, a dashed-line total, and a cash-remaining row.
- Cash-remaining row turns red when negative (bankruptcy warning).
- Updated the visible game version badge to `v3.8`.
- Tag: `v3.8-cost-breakdown`

### v3.7 - Operating costs and game over

- Added tiered daily operating costs (chi phí vận hành): 400k on Day 1-5, 650k on Day 6-11, 950k on Day 12+.
- Deducted automatically when the player advances to the next day.
- End-day summary now shows operating cost and cash remaining after deduction.
- Added a red warning in the summary if the deduction would result in negative cash.
- Added a game over screen (💸 Cửa hàng phá sản!) when cash goes negative after cost deduction.
- Game over screen shows final score and a button to open the leaderboard.
- Updated the visible game version badge to `v3.7`.
- Tag: `v3.7-operating-costs`

### v3.6 - Background music

- Added looping background music via HTML5 Audio API (`/homefarm-shop/bgm.mp3`).
- BGM starts when the player taps START GAME and loops throughout the session.
- Added a mute/unmute button (🔊/🔇) in the top-right corner of the game UI.
- Updated the visible game version badge to `v3.6`.
- Tag: `v3.6-bgm`

### v3.5 - Layout overhaul

- Moved toast bar outside of `<main>` so it sits pinned directly above the footer.
- Made shelf use `flex: 1` to fill all remaining space automatically instead of fixed height.
- Restored toast `border-radius: 12px` and added proper margin for breathing room.
- Updated the visible game version badge to `v3.5`.
- Tag: `v3.5-toast-fix`

### v3.4 - Bigger shelf controls

- Increased page tabs (1/2/3) height from 19px to 26px and font from 9px to 11px for easier tap on mobile.
- Increased BXH and upgrade pills height from 21px to 26px and font from 9px to 11px.
- Increased shelf-head row height to accommodate larger controls.
- Updated the visible game version badge to `v3.4`.
- Tag: `v3.4-ui-layout`

### v3.3 - Leaderboard spam fix

- Removed `setScoreSaved(false)` from the leaderboard open handler — button stays disabled after saving.
- Reset `scoreSaved` only when advancing to a new day, allowing one save per day with a new score.
- Updated the visible game version badge to `v3.3`.
- Tag: `v3.3-leaderboard-spam-fix`

### v3.2 - Leaderboard improvements

- Added medal icons 🥇🥈🥉 for top 1-2-3 in the leaderboard.
- Capped display to top 5 entries, then `· · ·` and the last entry.
- Inserted current player's row at their rank position (highlighted in yellow), even before saving.
- Updated the visible game version badge to `v3.2`.
- Tag: `v3.2-leaderboard`

### v3.1 - Player name input in tutorial

- Added player name input field to the tutorial modal with label "🧑‍🌾 Hãy nhập tên của bạn".
- Button disabled until a name is entered.
- Player name kept in session memory and used when saving to the leaderboard.
- Updated the visible game version badge to `v3.1`.
- Tag: `v3.1-player-name`

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

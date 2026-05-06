# Changelog

All notable Homefarm Shop Simulator changes are tracked here.

## v2.3.1 - Remove daily goal overlay

- Removed the daily goal bar from the active order panel so `ORDER`, `TIME`, and `MOOD` remain clearly visible.
- Removed daily goal reward logic from day transitions.
- Kept the end-day summary and VIP customer behavior from `v2.3`.
- Updated the visible game version badge to `v2.3.1`.

## v2.3 - Daily goals, end-day summary, VIP orders

- Added a real end-day summary modal with revenue, profit, served customers, skipped customers, max combo, rating, and goal result.
- Added rotating daily goals for revenue, served customers, and max combo.
- Added cash rewards for completed daily goals when advancing to the next day.
- Added VIP customers from day 3 onward with larger orders, lower patience, a visible VIP badge, and higher tip potential.
- Added per-day served/skipped/max-combo tracking for fair summary and goal scoring.
- Updated the visible game version badge to `v2.3`.

## v2.2.1 - Production build restore

- Restored the missing game component path needed for production builds.

## v2.2 - End-day summary groundwork

- Added initial end-day summary and customer type groundwork.
- Added game version configuration.

## v2.1 - Difficulty and events

- Restored scaling difficulty.
- Restored shop event behavior.

## v2.0 - Clean standalone simulator

- Cleaned the standalone Homefarm Simulator root version.

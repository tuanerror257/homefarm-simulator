import type { GameMode } from "@/types/homefarm-shop";

export type HomefarmModeConfig = {
  label: string;
  productExpansionDay: number;
  upgradeUnlockDay: number;
  eventUnlockDay: number;
  adUnlockDay: number;
  godModeTeaserDay: number;
  godModeStartDay: number;
  botUpgradeDayGate: number[];
  productUnlockDayScale: number;
  operatingCostMultiplier: number;
};

export const GAME_MODE_CONFIGS: Record<GameMode, HomefarmModeConfig> = {
  fullTime: {
    label: "Ca Full-time",
    productExpansionDay: 6,
    upgradeUnlockDay: 8,
    eventUnlockDay: 12,
    adUnlockDay: 15,
    godModeTeaserDay: 22,
    godModeStartDay: 36,
    botUpgradeDayGate: [8, 14, 20, 24, 27],
    productUnlockDayScale: 1,
    operatingCostMultiplier: 1,
  },
  partTime: {
    label: "Ca Part-time",
    productExpansionDay: 5,
    upgradeUnlockDay: 7,
    eventUnlockDay: 10,
    adUnlockDay: 12,
    godModeTeaserDay: 16,
    godModeStartDay: 26,
    botUpgradeDayGate: [7, 11, 15, 18, 21],
    productUnlockDayScale: 0.7,
    operatingCostMultiplier: 0.85,
  },
};

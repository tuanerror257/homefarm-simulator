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
    productExpansionDay: 4,
    upgradeUnlockDay: 6,
    eventUnlockDay: 9,
    adUnlockDay: 11,
    godModeTeaserDay: 18,
    godModeStartDay: 24,
    botUpgradeDayGate: [6, 9, 12, 15, 18],
    productUnlockDayScale: 0.6,
    operatingCostMultiplier: 0.82,
  },
};

export type Product = {
  id: string;
  name: string;
  icon: string;
  stock: number;
  unit: string;
  price: number;
  cost: number;
  color?: string;
  unlockDay?: number;
  category?: "core" | "fruit" | "meat" | "seafood" | "addon";
};

export type OrderItem = {
  id: string;
  qty: number;
};

export type CustomerType = {
  name: string;
  avatar: string;
  mood: string;
  patience: number;
  size: number;
  prefer?: string[];
  quote: string;
};

export type Customer = CustomerType & {
  orderNo: number;
  order: OrderItem[];
  repeat?: boolean;
  vip?: boolean;
  appOrder?: boolean;
};

export type ShopUpgradeId = "freezer" | "knife" | "sign" | "staff";

export type ShopUpgrades = Record<ShopUpgradeId, number>;

export type OperatingCostBreakdown = {
  rent: number;
  staff: number;
  utilities: number;
  other: number;
  total: number;
};

export type ProductStat = {
  id: string;
  name: string;
  icon: string;
  unit: string;
  soldQty: number;
  revenue: number;
};

export type EndDaySummaryData = {
  revenue: number;
  profit: number;
  served: number;
  total: number;
  skipped: number;
  combo: number;
  rating: number;
  operatingCost: OperatingCostBreakdown;
  cashAfterCost: number;
  topSellers: ProductStat[];
  excessStock: { name: string; icon: string; stock: number; unit: string }[];
};

export type MascotState =
  | "idle"
  | "happy"
  | "combo"
  | "wrong"
  | "hurry"
  | "fail"
  | "idea"
  | "thinking"
  | "trust";

export type ShopEvent = {
  id: string;
  title: string;
  description: string;
  type: "bad" | "good" | "neutral";
  cashDelta?: number;
  moodDelta?: number;
  stockDelta?: Record<string, number>;
};

export type GodModeCrisisId = "fire" | "food_safety" | "competitor" | "supply_crisis" | "tax_audit" | "epidemic";

export type ActiveCrisis = {
  id: GodModeCrisisId;
  title: string;
  icon: string;
  remainingDays: number;
  customerMultiplier?: number;
  importCostMultiplier?: number;
  closedToday?: boolean;
};

export type AchievementId =
  | "first_serve"
  | "combo_5"
  | "combo_10"
  | "perfect_day"
  | "big_revenue"
  | "total_100"
  | "millionaire"
  | "salmon_master"
  | "bulk_save_200"
  | "bulk_save_500"
  | "bulk_save_1000"
  | "bulk_save_1500"
  | "bulk_save_2000"
  | "sold_salmon_100"
  | "sold_beef_100"
  | "sold_pork_100"
  | "sold_egg_50"
  | "sold_shrimp_50"
  | "sold_sashimi_30"
  | "sold_fruit_100"
  | "sold_seafood_200"
  | "sold_meat_200"
  | "sold_dairy_100";

export type Achievement = {
  id: AchievementId;
  title: string;
  desc: string;
  icon: string;
};

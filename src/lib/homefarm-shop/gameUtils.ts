import type { Customer, CustomerType, Product, ShopEvent } from "@/types/homefarm-shop";
import { ALL_PRODUCTS, CUSTOMER_TYPES, SHOP_EVENTS } from "./data";

const PRODUCT_WEIGHTS: Record<string, number> = {
  salmon: 30,
  beef: 15,
  egg: 12,
  sausage: 8,
  grape: 7,
  cherry: 6,
  shrimp: 6,
  squid: 5,
  pork: 5,
  chicken: 7,
  avocado: 4,
  blueberry: 4,
  cheese: 4,
  milk: 6,
  oyster: 4,
  crab: 3,
  lamb: 4,
  duck: 4,
  strawberry: 5,
  kiwi: 4,
  butter: 4,
  yogurt: 5,
  scallop: 3,
  cod: 3,
  wagyu: 2,
  bacon: 4,
  mango: 4,
  orange: 5,
  ham: 4,
  bread: 5,
  wholeSalmon: 3,
  headBone: 2,
};

export function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}k`;
}

export function qty(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded).replace(".", ",");
}

function sample<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedPick(ids: string[]) {
  const pool = ids.flatMap((id) => Array(PRODUCT_WEIGHTS[id] || 1).fill(id));
  return sample(pool);
}

export function getUnlockedProducts(
  arg1: number | Product[],
  arg2?: number | Product[],
): Product[] {
  // Backward compatible:
  // - getUnlockedProducts(day, products)
  // - getUnlockedProducts(products, day)
  const day = typeof arg1 === "number" ? arg1 : typeof arg2 === "number" ? arg2 : 1;
  const products = Array.isArray(arg1)
    ? arg1
    : Array.isArray(arg2)
      ? arg2
      : ALL_PRODUCTS;

  // 5 ngày đầu giữ 8 mặt hàng để người chơi làm quen.
  // Từ ngày 6 mở thêm 2 món, sau đó tăng dần tới tối đa 32 món.
  const unlockedCount = Math.min(32, day <= 5 ? 8 : 8 + Math.floor(((day - 6) / 2 + 1)) * 2);
  return products.slice(0, unlockedCount);
}

function randomQty(product: Product, day: number) {
  const levelBoost = day >= 12 ? 1.25 : day >= 8 ? 1.15 : 1;

  if (product.id === "wholeSalmon") return 1; // bán theo con; 1 con mặc định 6kg
  if (["egg", "sausage", "cheese", "milk", "blueberry", "butter", "yogurt", "bacon", "ham", "bread"].includes(product.id)) {
    return sample([1, 2, 2, 3, day >= 10 ? 4 : 2]);
  }

  if (["cherry", "strawberry", "blueberry"].includes(product.id)) return sample([0.3, 0.5, 0.7, 1]);
  if (["grape", "avocado", "kiwi", "mango", "orange"].includes(product.id)) return sample([0.5, 0.7, 1, 1.2, 1.5]);
  if (product.id === "headBone") return sample([0.5, 0.7, 1, 1.2]);

  if (["salmon", "beef", "shrimp", "squid", "pork", "chicken", "oyster", "crab", "lamb", "duck", "scallop", "cod", "wagyu"].includes(product.id)) {
    const q = sample([0.4, 0.5, 0.7, 0.8, 1, 1.2, 1.5]);
    return Math.round(q * levelBoost * 10) / 10;
  }

  return sample([1, 1.2, 1.5]);
}

function buildOrder(products: Product[], customerType: CustomerType, day: number) {
  // First 5 days are calmer. Complexity only starts growing from day 6.
  const maxItemsByDay = day <= 5 ? 3 : day <= 9 ? 4 : day <= 15 ? 5 : 6;
  const maxItems = day <= 5 ? 2 : Math.min(5, 2 + Math.floor((day - 6) / 5));
  const itemCountPool =
    day <= 5
      ? [2, 2, 2, 3]
      : day <= 9
        ? [2, 3, 3, 4]
        : day <= 15
          ? [3, 3, 4, 4, 5]
          : [3, 4, 4, 5, 5, 6];

  const itemCount = Math.min(maxItems, sample(itemCountPool));
  const availableIds = products.map((p) => p.id);
  const validPrefer = (customerType.prefer || []).filter((id) => availableIds.includes(id));
  const orderIds = new Set<string>();

  while (orderIds.size < itemCount) {
    const shouldPrefer = validPrefer.length > 0 && Math.random() < 0.72;
    const id = shouldPrefer ? weightedPick(validPrefer) : weightedPick(availableIds);
    orderIds.add(id);
  }

  return [...orderIds].map((id) => {
    const product = products.find((p) => p.id === id)!;
    return { id, qty: randomQty(product, day) };
  });
}

export function generateCustomers(products: Product[], day: number): Customer[] {
  // First 5 days are easy onboarding. Day 6 onward starts scaling.
  const count = day <= 5 ? Math.min(3 + day, 8) : Math.min(8 + Math.floor((day - 6) * 0.8), 18);

  return Array.from({ length: count }).map((_, index) => {
    const type = sample(CUSTOMER_TYPES);
    const patienceModifier = day <= 5 ? 0 : Math.max(0, day - 5) * 0.75;

    return {
      ...type,
      orderNo: index + 1,
      patience: Math.max(8, Math.round(type.patience - patienceModifier + Math.random() * 5)),
      repeat: Math.random() < Math.min(0.1 + day * 0.025, 0.34),
      order: buildOrder(products, type, day),
    };
  });
}

export function calcTipRate(customer: Customer, timeLeft: number, moodScore: number, combo: number) {
  const speedRatio = Math.max(0, Math.min(1, timeLeft / customer.patience));
  const moodRatio = Math.max(0, Math.min(1, moodScore / 100));

  let rate = 0;
  if (speedRatio > 0.65) rate += 0.06;
  if (speedRatio > 0.35) rate += 0.03;
  if (moodRatio > 0.8) rate += 0.03;
  if (combo >= 2) rate += Math.min(0.04, combo * 0.01);
  if (customer.repeat) rate += 0.02;

  return Math.min(rate, 0.18);
}

export function getStockShortageMessage(product: Product) {
  if (product.id === "salmon") {
    return "Thiếu cá hồi fillet. Hãy fillet cá nguyên hoặc nhập thêm cá hồi.";
  }
  if (product.id === "headBone") {
    return "Thiếu đầu xương cá hồi. Hãy fillet cá nguyên để có thêm đầu xương.";
  }
  if (product.id === "wholeSalmon") {
    return "Thiếu cá nguyên con. Hãy nhập cá nguyên theo con.";
  }
  return `Thiếu ${product.name}. Hãy nhập thêm hàng.`;
}

export function maybeCreateEvent(day: number): ShopEvent | null {
  // No special events in first 5 days.
  if (day <= 5) return null;

  // From day 6, events start appearing. Chance increases slowly, max 38%.
  const chance = Math.min(0.16 + (day - 6) * 0.018, 0.38);
  if (Math.random() > chance) return null;

  return sample(SHOP_EVENTS);
}

export function applyEventToProducts(products: Product[], event: ShopEvent | null) {
  if (!event?.stockDelta) return products;

  return products.map((p) => {
    const delta = event.stockDelta?.[p.id] || 0;
    return { ...p, stock: Math.max(0, Number((p.stock + delta).toFixed(1))) };
  });
}

export function calculateScore(params: {
  day: number;
  cash: number;
  totalRevenue: number;
  totalProfit: number;
  servedCount: number;
  maxCombo: number;
}) {
  return Math.max(
    0,
    Math.round(
      params.cash +
        params.totalRevenue * 0.25 +
        params.totalProfit * 1.8 +
        params.servedCount * 120 +
        params.day * 250 +
        params.maxCombo * 180,
    ),
  );
}

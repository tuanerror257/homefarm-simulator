import type { Customer, CustomerType, DailyGoal, DailyGoalResult, Product, ShopEvent } from "@/types/homefarm-shop";
import { ALL_PRODUCTS, CUSTOMER_TYPES, SHOP_EVENTS } from "./data";

const PRODUCT_WEIGHTS: Record<string, number> = {
  salmon: 30,
  beef: 16,
  egg: 13,
  sausage: 10,
  grape: 9,
  cherry: 7,
  shrimp: 7,
  squid: 6,
  pork: 6,
  chicken: 7,
  avocado: 5,
  blueberry: 5,
  cheese: 5,
  milk: 6,
  oyster: 5,
  crab: 4,
  lamb: 4,
  duck: 4,
  strawberry: 5,
  kiwi: 4,
  butter: 4,
  yogurt: 5,
  scallop: 4,
  cod: 4,
  wagyu: 3,
  bacon: 4,
  mango: 4,
  orange: 5,
  ham: 4,
  bread: 5,
  wholeSalmon: 4,
  headBone: 3,
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function weightedPick(ids: string[]) {
  const pool = ids.flatMap((id) => Array(PRODUCT_WEIGHTS[id] || 1).fill(id));
  return sample(pool);
}

function unlockedCountByDay(day: number) {
  // Day 1-5: giữ 8 món core để người chơi làm quen.
  // Day 6: mở thêm 2 món.
  // Sau đó mỗi 2 ngày mở thêm 2 món, tối đa 32 món.
  if (day <= 5) return 8;
  return Math.min(32, 8 + (Math.floor((day - 6) / 2) + 1) * 2);
}

export function getUnlockedProducts(
  arg1: number | Product[],
  arg2?: number | Product[],
): Product[] {
  // Backward compatible:
  // - getUnlockedProducts(day, products)
  // - getUnlockedProducts(products, day)
  const day = typeof arg1 === "number" ? arg1 : typeof arg2 === "number" ? arg2 : 1;
  const currentProducts = Array.isArray(arg1)
    ? arg1
    : Array.isArray(arg2)
      ? arg2
      : [];

  const currentById = new Map(currentProducts.map((p) => [p.id, p]));
  const count = unlockedCountByDay(day);

  // Quan trọng: unlock phải dựa trên ALL_PRODUCTS, không dựa trên list hiện tại.
  // Nếu không, game sẽ bị kẹt mãi ở 8 món đầu.
  return ALL_PRODUCTS.slice(0, count).map((baseProduct) => {
    const current = currentById.get(baseProduct.id);
    return current
      ? {
          ...baseProduct,
          stock: current.stock,
        }
      : baseProduct;
  });
}

function maxItemsPerOrder(day: number) {
  if (day <= 2) return 2;
  if (day <= 5) return 3;
  if (day <= 8) return 4;
  if (day <= 11) return 5;
  return 6;
}

function pickOrderItemCount(day: number, customerType: CustomerType) {
  const maxItems = maxItemsPerOrder(day);
  const customerSizeBias = clamp(customerType.size || 2, 1, 6);

  let pool: number[];

  if (day <= 2) {
    pool = [1, 1, 2, 2];
  } else if (day <= 5) {
    pool = [1, 2, 2, 3];
  } else if (day <= 8) {
    pool = [1, 2, 2, 3, 3, 4];
  } else if (day <= 11) {
    pool = [2, 2, 3, 3, 4, 4, 5];
  } else if (day <= 16) {
    pool = [2, 3, 3, 4, 4, 5, 6];
  } else {
    pool = [3, 3, 4, 4, 5, 5, 6];
  }

  const rolled = sample(pool);
  const biased = Math.random() < 0.25 ? Math.min(maxItems, customerSizeBias) : rolled;

  return clamp(Math.min(maxItems, biased), 1, 6);
}

function randomQty(product: Product, day: number) {
  const levelBoost = day >= 16 ? 1.35 : day >= 12 ? 1.25 : day >= 8 ? 1.15 : 1;

  if (product.id === "wholeSalmon") {
    // Cá nguyên bán theo con, 1 con mặc định 6kg.
    return sample(day >= 12 ? [1, 1, 1, 2] : [1, 1, 1]);
  }

  if (["egg", "sausage", "cheese", "milk", "butter", "yogurt", "bacon", "ham", "bread"].includes(product.id)) {
    return sample(day >= 12 ? [1, 2, 2, 3, 3, 4] : [1, 1, 2, 2, 3]);
  }

  if (["blueberry"].includes(product.id)) return sample([1, 1, 2, 2, 3]);
  if (["cherry", "strawberry"].includes(product.id)) return sample([0.3, 0.5, 0.7, 1, 1.2]);
  if (["grape", "avocado", "kiwi", "mango", "orange"].includes(product.id)) return sample([0.5, 0.7, 1, 1.2, 1.5, 2]);
  if (product.id === "headBone") return sample([0.5, 0.7, 1, 1.2, 1.5]);

  if (
    [
      "salmon",
      "beef",
      "shrimp",
      "squid",
      "pork",
      "chicken",
      "oyster",
      "crab",
      "lamb",
      "duck",
      "scallop",
      "cod",
      "wagyu",
    ].includes(product.id)
  ) {
    const q = sample([0.4, 0.5, 0.7, 0.8, 1, 1.2, 1.5, day >= 10 ? 2 : 1]);
    return Math.round(q * levelBoost * 10) / 10;
  }

  return sample([1, 1.2, 1.5, 2]);
}

function buildOrder(products: Product[], customerType: CustomerType, day: number) {
  const itemCount = Math.min(pickOrderItemCount(day, customerType), products.length);
  const availableIds = products.map((p) => p.id);
  const validPrefer = (customerType.prefer || []).filter((id) => availableIds.includes(id));
  const orderIds = new Set<string>();

  let guard = 0;
  while (orderIds.size < itemCount && guard < 100) {
    guard += 1;
    const shouldPrefer = validPrefer.length > 0 && Math.random() < 0.68;
    const id = shouldPrefer ? weightedPick(validPrefer) : weightedPick(availableIds);
    orderIds.add(id);
  }

  return [...orderIds].map((id) => {
    const product = products.find((p) => p.id === id)!;
    return { id, qty: randomQty(product, day) };
  });
}

function boostVipOrder(order: Customer["order"]) {
  return order.map((item) => ({
    ...item,
    qty: Number((item.qty * 1.45).toFixed(1)),
  }));
}

function customersCountByDay(day: number) {
  // Tăng nhẹ theo ngày để ngày sau đông khách hơn nhưng không quá loạn UI.
  if (day <= 5) return 3 + day; // 4 -> 8 khách
  return Math.min(8 + Math.floor((day - 5) * 0.55), 18);
}

function patienceByDay(type: CustomerType, day: number) {
  const pressure = day <= 5 ? 0 : (day - 5) * 0.8;
  const randomBonus = Math.random() * 5;
  return Math.max(8, Math.round(type.patience - pressure + randomBonus));
}

export function generateCustomers(products: Product[], day: number): Customer[] {
  const count = customersCountByDay(day);

  return Array.from({ length: count }).map((_, index) => {
    const vipChance = day >= 3 ? Math.min(0.08 + day * 0.012, 0.22) : 0;
    const isVip = Math.random() < vipChance;
    const type = isVip
      ? sample(CUSTOMER_TYPES.filter((customer) => ["Khách VIP", "Nhà hàng", "Team party"].includes(customer.name)))
      : sample(CUSTOMER_TYPES);
    const order = buildOrder(products, type, isVip ? day + 5 : day);

    return {
      ...type,
      name: isVip ? `${type.name} VIP` : type.name,
      mood: isVip ? "Đơn lớn" : type.mood,
      orderNo: index + 1,
      patience: isVip ? Math.max(14, patienceByDay(type, day) - 5) : patienceByDay(type, day),
      repeat: isVip || Math.random() < Math.min(0.08 + day * 0.025, 0.38),
      vip: isVip,
      quote: isVip ? "Đơn lớn, làm nhanh tôi tip mạnh." : type.quote,
      order: isVip ? boostVipOrder(order) : order,
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
  if (combo >= 2) rate += Math.min(0.05, combo * 0.01);
  if (customer.repeat) rate += 0.02;
  if (customer.vip) rate += 0.06;

  return Math.min(rate, customer.vip ? 0.28 : 0.2);
}

export function getDailyGoal(day: number): DailyGoal {
  const cycle = day % 3;

  if (cycle === 1) {
    const target = 1900 + day * 500;
    return {
      id: `revenue-${day}`,
      type: "revenue",
      label: `Đạt ${money(target)} doanh thu ngày`,
      target,
      reward: 220 + day * 35,
    };
  }

  if (cycle === 2) {
    const target = Math.min(customersCountByDay(day), 3 + Math.floor(day * 0.7));
    return {
      id: `served-${day}`,
      type: "served",
      label: `Phục vụ ít nhất ${target} khách`,
      target,
      reward: 180 + day * 30,
    };
  }

  return {
    id: `combo-${day}`,
    type: "combo",
    label: `Giữ combo max x${Math.min(3 + Math.floor(day / 2), 10)}`,
    target: Math.min(3 + Math.floor(day / 2), 10),
    reward: 260 + day * 40,
  };
}

export function evaluateDailyGoal(
  goal: DailyGoal,
  stats: {
    revenue: number;
    profit: number;
    served: number;
    combo: number;
  },
): DailyGoalResult {
  const currentByType = {
    revenue: stats.revenue,
    profit: stats.profit,
    served: stats.served,
    combo: stats.combo,
  };
  const current = currentByType[goal.type];

  return {
    ...goal,
    current,
    completed: current >= goal.target,
  };
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
  // 5 ngày đầu yên bình để người chơi làm quen.
  if (day <= 5) return null;

  // Từ ngày 6 bắt đầu có sự kiện. Chance tăng dần nhưng có trần.
  const chance = Math.min(0.18 + (day - 6) * 0.02, 0.42);
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

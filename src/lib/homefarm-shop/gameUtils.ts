import type { Customer, CustomerType, Product, ShopEvent } from "@/types/homefarm-shop";
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
  sashimi: 6,
  avocado: 5,
  blueberry: 5,
  cheese: 5,
  milk: 6,
  oyster: 5,
  crab: 4,
  boCanada: 5,
  pizza: 5,
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

const OVERNIGHT_SPOILAGE_RATES: Record<NonNullable<Product["category"]>, number> = {
  seafood: 0.05,
  meat: 0.05,
  fruit: 0.04,
  core: 0.02,
  addon: 0.02,
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

  if (["egg", "sausage", "cheese", "milk", "butter", "yogurt", "bacon", "ham", "bread", "sashimi", "pizza"].includes(product.id)) {
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
      "oyster",
      "crab",
      "boCanada",
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
  return order.map((item) => {
    const boosted = item.qty * 1.45;
    // Preserve integer qty for unit-sold items (con, set, cái, hộp, gói…)
    const qty = Number.isInteger(item.qty) ? Math.max(1, Math.round(boosted)) : Number(boosted.toFixed(1));
    return { ...item, qty };
  });
}

// Tuần bận: day 6-8, 13-15, 20-22, 27-28. Tuần chậm: day 9-10, 16-17, 23-24.
export function getDayTheme(day: number): "busy" | "slow" | "normal" {
  const BUSY_DAYS = [6,7,8,13,14,15,20,21,22,27,28];
  const SLOW_DAYS = [9,10,16,17,23,24];
  if (BUSY_DAYS.includes(day)) return "busy";
  if (SLOW_DAYS.includes(day)) return "slow";
  return "normal";
}

function customersCountByDay(day: number) {
  // Tăng nhẹ theo ngày để ngày sau đông khách hơn nhưng không quá loạn UI.
  if (day <= 5) return 3 + day; // 4 -> 8 khách
  return Math.min(8 + Math.floor((day - 5) * 0.55), 18);
}

function patienceByDay(type: CustomerType, day: number, staffLevel = 0, theme: "busy" | "slow" | "normal" = "normal") {
  const pressure = day <= 5 ? 0 : (day - 5) * 0.55;
  const randomBonus = Math.random() * 5;
  const themeMod = theme === "busy" ? -4 : theme === "slow" ? 3 : 0;
  return Math.max(8, Math.round(type.patience - pressure + randomBonus + staffLevel * 2.5 + themeMod));
}

export function generateCustomers(
  products: Product[],
  day: number,
  options: {
    signLevel?: number;
    staffLevel?: number;
    rainyDay?: boolean;
    extraCount?: number;
    theme?: "busy" | "slow" | "normal";
    crisisMultiplier?: number;
  } = {},
): Customer[] {
  const theme = options.theme ?? getDayTheme(day);
  const baseCount = customersCountByDay(day);
  const themedCount = theme === "busy"
    ? Math.round(baseCount * 1.2)
    : theme === "slow"
      ? Math.round(baseCount * 0.75)
      : baseCount;
  const crisisMultiplier = options.crisisMultiplier ?? 1;
  const count = Math.max(0, Math.round(themedCount * crisisMultiplier)) + (options.extraCount ?? 0);
  const signLevel = options.signLevel ?? 0;
  const staffLevel = options.staffLevel ?? 0;
  const rainyDay = options.rainyDay ?? false;
  const appCustomer = CUSTOMER_TYPES.find((customer) => customer.name === "Shipper app");

  return Array.from({ length: count }).map((_, index) => {
    const vipChance = day >= 3 ? Math.min(0.08 + day * 0.012 + signLevel * 0.035, 0.32) : 0;
    const isVip = Math.random() < vipChance;
    let type = sample(CUSTOMER_TYPES);
    if (isVip) {
      type = sample(CUSTOMER_TYPES.filter((customer) => ["Khách VIP", "Nhà hàng", "Team party"].includes(customer.name)));
    } else if (rainyDay && appCustomer && Math.random() < 0.32) {
      type = appCustomer;
    }
    const appOrder = type.name === "Shipper app" || (!isVip && rainyDay && Math.random() < 0.18);
    const order = buildOrder(products, type, isVip ? day + 5 : day);
    const patience = patienceByDay(type, day, staffLevel, theme);

    return {
      ...type,
      name: isVip ? `${type.name} VIP` : type.name,
      mood: isVip ? "Đơn lớn" : type.mood,
      orderNo: index + 1,
      patience: isVip ? Math.max(14, patience - 5) : patience,
      repeat: isVip || Math.random() < Math.min(0.08 + day * 0.025, 0.38),
      vip: isVip,
      appOrder,
      quote: isVip ? "Đơn lớn, làm nhanh tôi tip mạnh." : type.quote,
      order: isVip ? boostVipOrder(order) : order,
    };
  });
}

export function calcTipRate(customer: Customer, timeLeft: number, moodScore: number, combo: number) {
  const speedRatio = Math.max(0, Math.min(1, timeLeft / customer.patience));
  const moodRatio = Math.max(0, Math.min(1, moodScore / 100));

  let rate = 0;
  if (speedRatio > 0.65) rate += 0.03; // phục vụ nhanh
  if (speedRatio > 0.35) rate += 0.015; // phục vụ ổn
  if (moodRatio > 0.8)   rate += 0.015; // mood tốt
  if (combo >= 2) rate += Math.min(0.02, combo * 0.004); // combo nhỏ
  if (customer.repeat)   rate += 0.01;  // khách quen
  if (customer.vip)      rate += 0.03;  // VIP

  return Math.min(rate, customer.vip ? 0.12 : 0.08);
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

export function maybeCreateEvent(day: number, products: Product[] = []): ShopEvent | null {
  // Day 1-11 yên bình để người chơi làm quen và mở rộng shop.
  if (day <= 11) return null;

  // Từ ngày 12 bắt đầu có sự kiện. Chance tăng dần nhưng có trần.
  const chance = Math.min(0.18 + (day - 12) * 0.02, 0.36);
  if (Math.random() > chance) return null;

  const event = sample(SHOP_EVENTS);

  if (event.id === "thief") {
    const stolen = Math.round((Math.random() * (2000 - 150) + 150) / 50) * 50;
    return {
      ...event,
      cashDelta: -stolen,
      description: `🦹 Có kẻ lén lút móc tiền quầy thu ngân. Mất ${money(stolen)} tiền mặt.`,
    };
  }

  if (event.id === "supplier-bonus") {
    const eligible = products.filter(
      (p) => p.cost > 0 && !["wholeSalmon", "headBone"].includes(p.id),
    );
    if (eligible.length === 0) return event;

    const count = Math.min(eligible.length, sample([1, 2, 2]));
    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);

    const stockDelta: Record<string, number> = {};
    const itemDescs: string[] = [];

    for (const p of picked) {
      let giftQty: number;
      if (["egg", "sausage", "cheese", "milk", "butter", "yogurt", "bacon", "ham", "bread"].includes(p.id)) {
        giftQty = sample([1, 2, 2, 3]);
      } else if (["cherry", "strawberry", "blueberry", "kiwi"].includes(p.id)) {
        giftQty = sample([0.3, 0.5, 0.5, 0.7]);
      } else if (["grape", "avocado", "mango", "orange"].includes(p.id)) {
        giftQty = sample([0.5, 0.7, 1, 1]);
      } else {
        giftQty = sample([0.3, 0.5, 0.5, 0.7]);
      }
      stockDelta[p.id] = giftQty;
      itemDescs.push(`${p.icon} ${p.name} +${qty(giftQty)}${p.unit}`);
    }

    return {
      ...event,
      stockDelta,
      description: `📦🎁 Nhà cung cấp gửi quà tri ân hôm nay: ${itemDescs.join(", ")}.`,
    };
  }

  return event;
}

export function applyEventToProducts(
  products: Product[],
  event: ShopEvent | null,
  options: {
    freezerLevel?: number;
  } = {},
) {
  if (!event?.stockDelta) return products;
  const freezerReduction = Math.min((options.freezerLevel ?? 0) * 0.25, 0.75);

  return products.map((p) => {
    const delta = event.stockDelta?.[p.id] || 0;
    const effectiveDelta = delta < 0 ? Number((delta * (1 - freezerReduction)).toFixed(1)) : delta;
    return { ...p, stock: Math.max(0, Number((p.stock + effectiveDelta).toFixed(1))) };
  });
}

export function applyOvernightSpoilage(
  products: Product[],
  options: {
    freezerLevel?: number;
  } = {},
) {
  const freezerReduction = Math.min((options.freezerLevel ?? 0) * 0.25, 0.75);
  let affectedCount = 0;
  let totalLoss = 0;

  const nextProducts = products.map((product) => {
    if (product.stock <= 0 || product.unit === "con") return product;

    const baseRate = OVERNIGHT_SPOILAGE_RATES[product.category ?? "addon"] ?? 0.02;
    const loss = Number((product.stock * baseRate * (1 - freezerReduction)).toFixed(1));
    if (loss <= 0) return product;

    affectedCount += 1;
    totalLoss += loss;

    return {
      ...product,
      stock: Math.max(0, Number((product.stock - loss).toFixed(1))),
    };
  });

  return {
    products: nextProducts,
    affectedCount,
    totalLoss: Number(totalLoss.toFixed(1)),
  };
}

// Hàm seeded pseudo-random để giá biến động cố định trong cùng 1 ngày
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getDailyCost(product: Product, day: number): number {
  if (product.cost <= 0) return 0;
  const seed = day * 1000 + product.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  // ±15% biến động, làm tròn về bội số 5
  const multiplier = 0.85 + rand * 0.3; // [0.85, 1.15]
  return Math.round((product.cost * multiplier) / 5) * 5;
}

export function getDailyCostDelta(product: Product, day: number): number {
  if (product.cost <= 0) return 0;
  const dailyCost = getDailyCost(product, day);
  return Math.round(((dailyCost - product.cost) / product.cost) * 100);
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
        params.totalRevenue * 0.15 +
        params.totalProfit * 2.2 +
        params.servedCount * 90 +
        params.day * 120 +
        params.maxCombo * 220,
    ),
  );
}

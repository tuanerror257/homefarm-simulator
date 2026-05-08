#!/usr/bin/env node

const DEFAULT_RUNS = 100;
const DEFAULT_DAYS = 60;
const GOD_MODE_START_DAY = 36;
const APP_ORDER_SHIPPING_FEE = 20;
const MAX_UPGRADE_LEVEL = 5;
const BOT_UPGRADE_DAY_GATE = [8, 14, 20, 24, 27];
const BULK_THRESHOLD = 5;
const BULK_DISCOUNT = 0.06;
const CASH_RESERVE = 2000;

const ALL_PRODUCTS = [
  { id: "salmon", name: "Ca hoi", stock: 12.4, unit: "kg", price: 769, cost: 520, unlockDay: 1, category: "seafood" },
  { id: "wholeSalmon", name: "Ca nguyen", stock: 3, unit: "con", price: 559 * 6, cost: 430 * 6, unlockDay: 1, category: "seafood" },
  { id: "beef", name: "Bo My", stock: 8.6, unit: "kg", price: 429, cost: 260, unlockDay: 1, category: "meat" },
  { id: "egg", name: "Trung", stock: 18, unit: "hop", price: 69, cost: 42, unlockDay: 1, category: "core" },
  { id: "sausage", name: "Xuc xich", stock: 16, unit: "goi", price: 89, cost: 55, unlockDay: 1, category: "addon" },
  { id: "grape", name: "Nho My", stock: 7.8, unit: "kg", price: 199, cost: 125, unlockDay: 1, category: "fruit" },
  { id: "cherry", name: "Cherry", stock: 4.4, unit: "kg", price: 459, cost: 310, unlockDay: 1, category: "fruit" },
  { id: "headBone", name: "Dau xuong", stock: 2.2, unit: "kg", price: 89, cost: 0, unlockDay: 1, category: "addon" },
  { id: "shrimp", name: "Tom su", stock: 4.5, unit: "kg", price: 329, cost: 220, unlockDay: 6, category: "seafood" },
  { id: "squid", name: "Muc", stock: 4.2, unit: "kg", price: 259, cost: 175, unlockDay: 6, category: "seafood" },
  { id: "pork", name: "Heo Iberico", stock: 5.5, unit: "kg", price: 359, cost: 230, unlockDay: 8, category: "meat" },
  { id: "sashimi", name: "Set sashimi", stock: 5, unit: "set", price: 299, cost: 195, unlockDay: 8, category: "seafood" },
  { id: "avocado", name: "Bo", stock: 5, unit: "kg", price: 169, cost: 105, unlockDay: 10, category: "fruit" },
  { id: "blueberry", name: "Viet quat", stock: 3.5, unit: "hop", price: 139, cost: 88, unlockDay: 10, category: "fruit" },
  { id: "cheese", name: "Pho mai", stock: 8, unit: "goi", price: 119, cost: 72, unlockDay: 12, category: "addon" },
  { id: "milk", name: "Sua tuoi", stock: 10, unit: "chai", price: 49, cost: 30, unlockDay: 12, category: "core" },
  { id: "oyster", name: "Hau", stock: 4, unit: "kg", price: 219, cost: 145, unlockDay: 14, category: "seafood" },
  { id: "crab", name: "Cua", stock: 3.5, unit: "kg", price: 499, cost: 340, unlockDay: 14, category: "seafood" },
  { id: "boCanada", name: "Bo Canada", stock: 4, unit: "kg", price: 589, cost: 385, unlockDay: 16, category: "meat" },
  { id: "pizza", name: "Pizza", stock: 5, unit: "cai", price: 249, cost: 160, unlockDay: 16, category: "addon" },
  { id: "strawberry", name: "Dau tay", stock: 4.2, unit: "kg", price: 299, cost: 195, unlockDay: 18, category: "fruit" },
  { id: "kiwi", name: "Kiwi", stock: 5, unit: "kg", price: 169, cost: 108, unlockDay: 18, category: "fruit" },
  { id: "butter", name: "Bo lat", stock: 8, unit: "hop", price: 99, cost: 62, unlockDay: 20, category: "addon" },
  { id: "yogurt", name: "Sua chua", stock: 10, unit: "hop", price: 59, cost: 36, unlockDay: 20, category: "core" },
  { id: "scallop", name: "So diep", stock: 3.2, unit: "kg", price: 459, cost: 315, unlockDay: 22, category: "seafood" },
  { id: "cod", name: "Ca tuyet", stock: 3.8, unit: "kg", price: 399, cost: 270, unlockDay: 22, category: "seafood" },
  { id: "wagyu", name: "Wagyu", stock: 2.5, unit: "kg", price: 1299, cost: 920, unlockDay: 24, category: "meat" },
  { id: "bacon", name: "Bacon", stock: 7, unit: "goi", price: 129, cost: 78, unlockDay: 24, category: "meat" },
  { id: "mango", name: "Xoai Uc", stock: 5, unit: "kg", price: 189, cost: 118, unlockDay: 26, category: "fruit" },
  { id: "orange", name: "Cam", stock: 6, unit: "kg", price: 129, cost: 78, unlockDay: 26, category: "fruit" },
  { id: "ham", name: "Jambon", stock: 8, unit: "goi", price: 109, cost: 68, unlockDay: 28, category: "addon" },
  { id: "bread", name: "Banh mi", stock: 12, unit: "o", price: 39, cost: 22, unlockDay: 28, category: "core" },
];

const CUSTOMER_TYPES = [
  { name: "Me dam", patience: 24, size: 4, prefer: ["salmon", "beef", "egg", "sashimi"] },
  { name: "Gym Bro", patience: 26, size: 3, prefer: ["beef", "egg", "salmon", "sashimi", "wagyu"] },
  { name: "Gen Z", patience: 36, size: 3, prefer: ["salmon", "grape", "cherry", "avocado", "blueberry", "yogurt"] },
  { name: "Khach VIP", patience: 22, size: 5, prefer: ["salmon", "beef", "cherry", "shrimp", "wagyu", "crab"] },
  { name: "Kho tinh", patience: 16, size: 4, prefer: ["salmon", "beef", "wagyu"] },
  { name: "De tinh", patience: 42, size: 2, prefer: ["egg", "sausage", "grape", "milk", "bread"] },
  { name: "Gia dinh", patience: 30, size: 5, prefer: ["salmon", "beef", "egg", "sausage", "pizza", "orange"] },
  { name: "Dan van phong", patience: 28, size: 3, prefer: ["sausage", "egg", "beef", "milk", "bread"] },
  { name: "Foodie", patience: 25, size: 4, prefer: ["salmon", "beef", "cherry", "cheese", "oyster", "scallop"] },
  { name: "Sinh vien", patience: 35, size: 2, prefer: ["egg", "sausage", "milk", "bread"] },
  { name: "Nguoi gia", patience: 45, size: 2, prefer: ["salmon", "egg", "headBone", "yogurt"] },
  { name: "Streamer", patience: 20, size: 3, prefer: ["salmon", "beef", "sausage", "strawberry"] },
  { name: "Cap doi", patience: 30, size: 3, prefer: ["cherry", "grape", "salmon", "cheese", "strawberry"] },
  { name: "Shipper app", patience: 17, size: 3, prefer: ["salmon", "beef", "egg", "sausage", "milk"] },
  { name: "Team party", patience: 23, size: 5, prefer: ["beef", "salmon", "cherry", "grape", "shrimp", "cheese"] },
  { name: "Khach Nhat", patience: 26, size: 3, prefer: ["salmon", "wholeSalmon", "squid", "cod"] },
  { name: "Nha hang", patience: 20, size: 4, prefer: ["wholeSalmon", "salmon", "beef", "shrimp", "oyster"] },
  { name: "Khach nau lau", patience: 32, size: 2, prefer: ["headBone", "beef", "salmon", "pork"] },
  { name: "Khach Han", patience: 27, size: 3, prefer: ["beef", "pork", "sashimi", "bacon", "egg"] },
  { name: "Ba noi tro VIP", patience: 22, size: 4, prefer: ["wagyu", "cheese", "scallop", "salmon", "crab"] },
  { name: "Dau bep", patience: 24, size: 4, prefer: ["wholeSalmon", "oyster", "crab", "cod", "scallop"] },
  { name: "Nhom sinh nhat", patience: 28, size: 5, prefer: ["strawberry", "cherry", "grape", "cheese", "salmon"] },
  { name: "Gym girl", patience: 33, size: 3, prefer: ["blueberry", "avocado", "yogurt", "egg", "salmon"] },
  { name: "Ong chu quan", patience: 21, size: 4, prefer: ["wholeSalmon", "beef", "pork", "shrimp", "egg"] },
  { name: "Khach du lich", patience: 15, size: 2, prefer: ["sausage", "cheese", "bread", "milk", "grape"] },
];

const PRODUCT_WEIGHTS = {
  salmon: 30, beef: 16, egg: 13, sausage: 10, grape: 9, cherry: 7, shrimp: 7, squid: 6,
  pork: 6, sashimi: 6, avocado: 5, blueberry: 5, cheese: 5, milk: 6, oyster: 5, crab: 4,
  boCanada: 5, pizza: 5, strawberry: 5, kiwi: 4, butter: 4, yogurt: 5, scallop: 4, cod: 4,
  wagyu: 3, bacon: 4, mango: 4, orange: 5, ham: 4, bread: 5, wholeSalmon: 4, headBone: 3,
};

const UPGRADE_DEFS = {
  knife: { costs: [500, 1100, 2200, 4000, 7000] },
  staff: { costs: [800, 1600, 3200, 5500, 9000] },
  sign: { costs: [700, 1400, 2800, 4800, 8000] },
  freezer: { costs: [650, 1300, 2600, 4200, 7000] },
};

const KNIFE_SALMON_BONUS_BY_LEVEL = [0, 0.35, 0.7, 1.1, 1.55, 2.1];
const KNIFE_HEAD_BONE_BONUS_BY_LEVEL = [0, 0.1, 0.2, 0.35, 0.5, 0.7];
const FREEZER_REDUCTION_BY_LEVEL = [0, 0.25, 0.5, 0.75, 0.85, 0.95];
const SPOILAGE_RATES = { seafood: 0.05, meat: 0.05, fruit: 0.04, core: 0.02, addon: 0.02 };
const BUSY_DAYS = new Set([6, 7, 8, 13, 14, 15, 20, 21, 22, 27, 28]);
const SLOW_DAYS = new Set([9, 10, 16, 17, 23, 24]);
const SNAPSHOT_DAYS = [5, 10, 15, 20, 30, 36, 45, 60];

function parseArgs(argv) {
  const args = { runs: DEFAULT_RUNS, days: DEFAULT_DAYS, seed: 20260508, json: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") args.json = true;
    else if (arg === "--runs") args.runs = Number(argv[++i]);
    else if (arg === "--days") args.days = Number(argv[++i]);
    else if (arg === "--seed") args.seed = Number(argv[++i]);
  }
  if (!Number.isFinite(args.runs) || args.runs < 1) throw new Error("--runs must be a positive number");
  if (!Number.isFinite(args.days) || args.days < 1) throw new Error("--days must be a positive number");
  if (!Number.isFinite(args.seed)) throw new Error("--seed must be a number");
  return args;
}

function makeRng(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function money(value) {
  return `${Math.round(value).toLocaleString("vi-VN")}k`;
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[index];
}

function unlockedCountByDay(day) {
  if (day <= 5) return 8;
  return Math.min(32, 8 + (Math.floor((day - 6) / 2) + 1) * 2);
}

function getUnlockedProducts(day, currentProducts) {
  const currentById = new Map(currentProducts.map((p) => [p.id, p]));
  return ALL_PRODUCTS.slice(0, unlockedCountByDay(day)).map((base) => ({
    ...base,
    stock: currentById.get(base.id)?.stock ?? base.stock,
  }));
}

function getDayTheme(day) {
  if (BUSY_DAYS.has(day)) return "busy";
  if (SLOW_DAYS.has(day)) return "slow";
  return "normal";
}

function customersCountByDay(day) {
  if (day <= 5) return 3 + day;
  return Math.min(8 + Math.floor((day - 5) * 0.55), 13);
}

function themedCustomerCount(day, crisisMultiplier, extraCount) {
  const base = customersCountByDay(day);
  const theme = getDayTheme(day);
  const themed = theme === "busy" ? Math.round(base * 1.2) : theme === "slow" ? Math.round(base * 0.75) : base;
  return Math.max(0, Math.round(themed * crisisMultiplier)) + extraCount;
}

function maxItemsPerOrder(day) {
  if (day <= 2) return 2;
  if (day <= 5) return 3;
  if (day <= 8) return 4;
  if (day <= 11) return 5;
  return 6;
}

function pickOrderItemCount(rng, day, customerType) {
  const pools = day <= 2
    ? [1, 1, 2, 2]
    : day <= 5
      ? [1, 2, 2, 3]
      : day <= 8
        ? [1, 2, 2, 3, 3, 4]
        : day <= 11
          ? [2, 2, 3, 3, 4, 4, 5]
          : day <= 16
            ? [2, 3, 3, 4, 4, 5, 6]
            : [3, 3, 4, 4, 5, 5, 6];
  const rolled = sample(rng, pools);
  const biased = rng() < 0.25 ? Math.min(maxItemsPerOrder(day), clamp(customerType.size, 1, 6)) : rolled;
  return clamp(Math.min(maxItemsPerOrder(day), biased), 1, 6);
}

function weightedPick(rng, ids) {
  const totalWeight = ids.reduce((sum, id) => sum + (PRODUCT_WEIGHTS[id] ?? 1), 0);
  let roll = rng() * totalWeight;
  for (const id of ids) {
    roll -= PRODUCT_WEIGHTS[id] ?? 1;
    if (roll <= 0) return id;
  }
  return ids[ids.length - 1];
}

function randomQty(rng, product, day) {
  const levelBoost = day >= 16 ? 1.35 : day >= 12 ? 1.25 : day >= 8 ? 1.15 : 1;
  if (product.id === "wholeSalmon") return sample(rng, day >= 12 ? [1, 1, 1, 2] : [1, 1, 1]);
  if (["egg", "sausage", "cheese", "milk", "butter", "yogurt", "bacon", "ham", "bread", "sashimi", "pizza"].includes(product.id)) {
    return sample(rng, day >= 12 ? [1, 2, 2, 3, 3, 4] : [1, 1, 2, 2, 3]);
  }
  if (product.id === "blueberry") return sample(rng, [1, 1, 2, 2, 3]);
  if (["cherry", "strawberry"].includes(product.id)) return sample(rng, [0.3, 0.5, 0.7, 1, 1.2]);
  if (["grape", "avocado", "kiwi", "mango", "orange"].includes(product.id)) return sample(rng, [0.5, 0.7, 1, 1.2, 1.5, 2]);
  if (product.id === "headBone") return sample(rng, [0.5, 0.7, 1, 1.2, 1.5]);
  const q = sample(rng, [0.4, 0.5, 0.7, 0.8, 1, 1.2, 1.5, day >= 10 ? 2 : 1]);
  return Math.round(q * levelBoost * 10) / 10;
}

function buildOrder(rng, products, customerType, day) {
  const itemCount = Math.min(pickOrderItemCount(rng, day, customerType), products.length);
  const availableIds = products.map((p) => p.id);
  const validPrefer = customerType.prefer.filter((id) => availableIds.includes(id));
  const orderIds = new Set();
  let guard = 0;
  while (orderIds.size < itemCount && guard < 100) {
    guard += 1;
    const prefer = validPrefer.length > 0 && rng() < 0.68;
    orderIds.add(prefer ? weightedPick(rng, validPrefer) : weightedPick(rng, availableIds));
  }
  return [...orderIds].map((id) => {
    const product = products.find((p) => p.id === id);
    return { id, qty: randomQty(rng, product, day) };
  });
}

function generateCustomers(rng, products, day, state, options = {}) {
  const count = themedCustomerCount(day, options.crisisMultiplier ?? 1, state.pendingExtraCustomers);
  const signLevel = state.upgrades.sign;
  const appCustomer = CUSTOMER_TYPES.find((c) => c.name === "Shipper app");

  return Array.from({ length: count }).map((_, index) => {
    const vipBaseChance = 0.08 + day * 0.012;
    const vipCap = Math.min(0.32 + signLevel * 0.035, 0.5);
    const vipChance = day >= 3 ? Math.min(vipBaseChance + signLevel * 0.025, vipCap) : 0;
    const isVip = rng() < vipChance;
    let type = sample(rng, CUSTOMER_TYPES);
    if (isVip) {
      type = sample(rng, CUSTOMER_TYPES.filter((c) => ["Khach VIP", "Nha hang", "Team party"].includes(c.name)));
    } else if (options.rainyDay && appCustomer && rng() < 0.32) {
      type = appCustomer;
    }
    const appOrder = type.name === "Shipper app" || (!isVip && options.rainyDay && rng() < 0.18);
    const order = buildOrder(rng, products, type, isVip ? day + 5 : day).map((item) => {
      if (!isVip) return item;
      const boosted = item.qty * 1.45;
      return { ...item, qty: Number.isInteger(item.qty) ? Math.max(1, Math.round(boosted)) : Number(boosted.toFixed(1)) };
    });
    return { orderNo: index + 1, type: type.name, order, vip: isVip, appOrder };
  });
}

function seededDailyCost(product, day) {
  if (product.cost <= 0) return 0;
  const charSeed = product.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const x = Math.sin(day * 1000 + charSeed) * 10000;
  const rand = x - Math.floor(x);
  return Math.round((product.cost * (0.85 + rand * 0.3)) / 5) * 5;
}

function getOperatingCost(rng, day) {
  const tier = day <= 5
    ? { rent: 400, staff: 150, utilities: 30, otherMin: 10, otherMax: 50 }
    : day <= 11
      ? { rent: 400, staff: 250, utilities: 70, otherMin: 30, otherMax: 80 }
      : day <= 17
        ? { rent: 400, staff: 400, utilities: 100, otherMin: 50, otherMax: 150 }
        : { rent: 400, staff: 600, utilities: 150, otherMin: 100, otherMax: 300 };
  const other = Math.round((rng() * (tier.otherMax - tier.otherMin) + tier.otherMin) / 10) * 10;
  return tier.rent + tier.staff + tier.utilities + other;
}

function applySpoilage(products, freezerLevel) {
  const reduction = FREEZER_REDUCTION_BY_LEVEL[freezerLevel] ?? 0;
  let lossValue = 0;
  const next = products.map((product) => {
    if (product.stock <= 0 || product.unit === "con") return product;
    const loss = Number((product.stock * (SPOILAGE_RATES[product.category] ?? 0.02) * (1 - reduction)).toFixed(1));
    if (loss <= 0) return product;
    lossValue += loss * product.cost;
    return { ...product, stock: Math.max(0, Number((product.stock - loss).toFixed(1))) };
  });
  return { products: next, lossValue };
}

function maybeCreateEvent(rng, day, products) {
  if (day <= 11) return { id: null, cashDelta: 0, moodDelta: 0, stockDelta: {} };
  const chance = Math.min(0.18 + (day - 12) * 0.02, 0.36);
  if (rng() > chance) return { id: null, cashDelta: 0, moodDelta: 0, stockDelta: {} };
  const id = sample(rng, ["staff-off", "thief", "freezer-issue", "viral-post", "supplier-bonus", "loyal-customer", "rainy-day"]);
  if (id === "thief") return { id, cashDelta: -Math.round((rng() * (2000 - 150) + 150) / 50) * 50, moodDelta: 0, stockDelta: {} };
  if (id === "viral-post") return { id, cashDelta: 100, moodDelta: 8, stockDelta: {} };
  if (id === "loyal-customer") return { id, cashDelta: 0, moodDelta: 12, stockDelta: {} };
  if (id === "rainy-day") return { id, cashDelta: 0, moodDelta: -4, stockDelta: {} };
  if (id === "staff-off") return { id, cashDelta: 0, moodDelta: -10, stockDelta: {} };
  if (id === "freezer-issue") return { id, cashDelta: 0, moodDelta: 0, stockDelta: { salmon: -0.5, beef: -0.5 } };
  const eligible = products.filter((p) => p.cost > 0 && !["wholeSalmon", "headBone"].includes(p.id));
  const picked = [...eligible].sort(() => rng() - 0.5).slice(0, Math.min(eligible.length, sample(rng, [1, 2, 2])));
  return { id, cashDelta: 0, moodDelta: 0, stockDelta: Object.fromEntries(picked.map((p) => [p.id, 1])) };
}

function applyEventToProducts(products, event, freezerLevel) {
  const reduction = FREEZER_REDUCTION_BY_LEVEL[freezerLevel] ?? 0;
  return products.map((product) => {
    const delta = event.stockDelta[product.id] ?? 0;
    const effectiveDelta = delta < 0 ? Number((delta * (1 - reduction)).toFixed(1)) : delta;
    return { ...product, stock: Math.max(0, Number((product.stock + effectiveDelta).toFixed(1))) };
  });
}

function filletOne(state) {
  const whole = state.products.find((p) => p.id === "wholeSalmon");
  if (!whole || whole.stock < 1) return false;
  const salmonYield = 4.8 + (KNIFE_SALMON_BONUS_BY_LEVEL[state.upgrades.knife] ?? 0);
  const headBoneYield = 1.2 + (KNIFE_HEAD_BONE_BONUS_BY_LEVEL[state.upgrades.knife] ?? 0);
  state.products = state.products.map((p) => {
    if (p.id === "wholeSalmon") return { ...p, stock: Number((p.stock - 1).toFixed(1)) };
    if (p.id === "salmon") return { ...p, stock: Number((p.stock + salmonYield).toFixed(1)) };
    if (p.id === "headBone") return { ...p, stock: Number((p.stock + headBoneYield).toFixed(1)) };
    return p;
  });
  state.stats.fillets += 1;
  return true;
}

function importItems(state, importPlan, day, multiplier = 1, allowReserve = true) {
  let cost = 0;
  for (const [id, qty] of Object.entries(importPlan)) {
    const product = state.products.find((p) => p.id === id);
    if (!product || product.cost <= 0 || qty <= 0) continue;
    const discount = qty >= BULK_THRESHOLD ? BULK_DISCOUNT : 0;
    cost += qty * seededDailyCost(product, day) * multiplier * (1 - discount);
  }
  if (cost <= 0) return false;
  if (state.cash < cost || (allowReserve && state.cash - cost < CASH_RESERVE)) return false;
  state.cash -= cost;
  state.stats.importSpend += cost;
  state.products = state.products.map((p) => ({ ...p, stock: Number((p.stock + (importPlan[p.id] ?? 0)).toFixed(1)) }));
  return true;
}

function buyOneUpgrade(state, day) {
  const order = ["staff", "freezer", "sign", "knife"];
  for (const id of order) {
    const level = state.upgrades[id];
    if (level >= MAX_UPGRADE_LEVEL) continue;
    if (day < BOT_UPGRADE_DAY_GATE[level]) continue;
    const cost = UPGRADE_DEFS[id].costs[level];
    if (state.cash >= cost * 2) {
      state.cash -= cost;
      state.upgrades[id] += 1;
      state.stats.upgrades.push({ id, level: level + 1, day, cost });
      return true;
    }
  }
  return false;
}

function restockForTomorrow(state, day, crisisImportMultiplier) {
  const nextDay = day + 1;
  const nextCustomers = customersCountByDay(nextDay);
  const avgItems = nextDay <= 8 ? 2 : nextDay <= 16 ? 3.5 : 4.5;
  const importable = state.products.filter((p) => p.cost > 0 && p.id !== "wholeSalmon");
  const orderProb = Math.min(0.9, avgItems / Math.max(1, importable.length));
  const plan = {};

  for (const product of importable) {
    const avgQty = ["egg", "sausage", "cheese", "milk", "butter", "yogurt", "bacon", "ham", "bread"].includes(product.id)
      ? 2
      : ["cherry", "strawberry"].includes(product.id)
        ? 0.7
        : ["grape", "avocado", "kiwi", "mango", "orange"].includes(product.id)
          ? 1.2
          : product.id === "blueberry"
            ? 1.5
            : 0.9;
    const target = Math.max(2, Math.ceil(nextCustomers * orderProb * avgQty * 1.3));
    const need = Math.max(0, target - product.stock);
    if (need > 0) plan[product.id] = need;
  }

  return importItems(state, plan, nextDay, crisisImportMultiplier, true);
}

function ensureOrderStock(state, order, day, crisisImportMultiplier) {
  let safety = 0;
  while (safety < 3) {
    safety += 1;
    const shortItems = order.filter((item) => {
      const product = state.products.find((p) => p.id === item.id);
      return (product?.stock ?? 0) < item.qty;
    });
    if (shortItems.length === 0) return true;

    const needsFillet = shortItems.some((item) => item.id === "salmon" || item.id === "headBone");
    if (needsFillet && filletOne(state)) continue;

    const plan = {};
    for (const item of shortItems) {
      const product = state.products.find((p) => p.id === item.id);
      if (!product || product.cost <= 0) continue;
      plan[item.id] = Math.ceil(item.qty - product.stock) + 3;
    }
    if (!importItems(state, plan, day, crisisImportMultiplier, false)) return false;
  }
  return false;
}

function calcTipRate(customer, speedRatio, moodScore, combo) {
  const moodRatio = Math.max(0, Math.min(1, moodScore / 100));
  let rate = 0;
  if (speedRatio > 0.65) rate += 0.03;
  if (speedRatio > 0.35) rate += 0.015;
  if (moodRatio > 0.8) rate += 0.015;
  if (combo >= 2) rate += Math.min(0.02, combo * 0.004);
  if (customer.vip) rate += 0.03;
  return Math.min(rate, customer.vip ? 0.07 : 0.04);
}

function serveCustomer(rng, state, customer, day, crisisImportMultiplier) {
  if (!ensureOrderStock(state, customer.order, day, crisisImportMultiplier)) {
    state.combo = 0;
    state.stats.skipped += 1;
    return;
  }

  const moodScore = clamp(92 - day * 0.4 + state.upgrades.staff * 4 + rng() * 12, 35, 100);
  const speedRatio = clamp(0.45 + state.upgrades.staff * 0.04 + rng() * 0.45, 0.2, 1);
  const bill = customer.order.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.id);
    return sum + product.price * item.qty;
  }, 0);
  const orderProfit = customer.order.reduce((sum, item) => {
    const product = state.products.find((p) => p.id === item.id);
    return sum + (product.price - product.cost) * item.qty;
  }, 0);
  const nextCombo = speedRatio > 0.45 && moodScore >= 40 ? state.combo + 1 : 0;
  const multiplier = nextCombo >= 10 ? 2 : nextCombo >= 5 ? 1.5 : nextCombo >= 3 ? 1.2 : 1;
  const comboBonus = nextCombo >= 3 ? Math.round(bill * (multiplier - 1) * 0.04) : 0;
  const tip = Math.round(bill * calcTipRate(customer, speedRatio, moodScore, state.combo));
  const shippingFee = customer.appOrder ? APP_ORDER_SHIPPING_FEE : 0;
  const profit = orderProfit + tip + comboBonus - shippingFee;

  state.products = state.products.map((p) => {
    const item = customer.order.find((orderItem) => orderItem.id === p.id);
    return item ? { ...p, stock: Number((p.stock - item.qty).toFixed(1)) } : p;
  });
  state.cash += bill + tip + comboBonus - shippingFee;
  state.totalRevenue += bill;
  state.totalProfit += profit;
  state.combo = nextCombo;
  state.maxCombo = Math.max(state.maxCombo, nextCombo);
  state.stats.served += 1;
  state.stats.tips += tip;
}

function rollGodMode(rng, state, nextDay) {
  const surviving = state.activeCrises
    .map((crisis) => ({ ...crisis, remainingDays: crisis.remainingDays - 1 }))
    .filter((crisis) => crisis.remainingDays > 0);
  const newCrises = [];
  const daysInGodMode = nextDay - GOD_MODE_START_DAY;

  if (nextDay >= GOD_MODE_START_DAY) {
    const defs = [
      { id: "fire", baseChance: 0.03, duration: 1 },
      { id: "food_safety", baseChance: 0.04, duration: 1, customerMultiplier: 0.4 },
      { id: "competitor", baseChance: 0.05, duration: 3, customerMultiplier: 0.65 },
      { id: "supply_crisis", baseChance: 0.04, duration: 3, importCostMultiplier: 1.5 },
      { id: "tax_audit", baseChance: 0.03, duration: 1 },
      { id: "epidemic", baseChance: 0.03, duration: 2, closedToday: true },
    ];
    for (const def of defs) {
      const chance = Math.min(def.baseChance + daysInGodMode * 0.03, 0.65);
      if (rng() >= chance) continue;
      state.stats.crises[def.id] = (state.stats.crises[def.id] ?? 0) + 1;
      if (def.id === "fire") {
        state.products = state.products.map((p) => ["seafood", "meat"].includes(p.category) ? { ...p, stock: 0 } : p);
      }
      if (def.id === "food_safety") state.cash -= Math.round((3000 + rng() * 3000) / 100) * 100;
      if (def.id === "tax_audit") state.cash -= Math.round(state.cash * (0.25 + rng() * 0.15));
      newCrises.push({
        id: def.id,
        remainingDays: def.duration,
        customerMultiplier: def.customerMultiplier,
        importCostMultiplier: def.importCostMultiplier,
        closedToday: def.closedToday,
      });
    }
  }

  state.activeCrises = [...surviving.filter((old) => !newCrises.some((crisis) => crisis.id === old.id)), ...newCrises];
}

function simulateRun(seed, maxDays) {
  const rng = makeRng(seed);
  const state = {
    cash: 1000,
    totalRevenue: 0,
    totalProfit: 0,
    combo: 0,
    maxCombo: 0,
    day: 1,
    pendingExtraCustomers: 0,
    products: getUnlockedProducts(1, []),
    upgrades: { freezer: 0, knife: 0, sign: 0, staff: 0 },
    activeCrises: [],
    snapshots: {},
    stats: {
      served: 0,
      skipped: 0,
      tips: 0,
      fillets: 0,
      importSpend: 0,
      spoilageLossValue: 0,
      upgrades: [],
      events: {},
      crises: {},
    },
    failureReason: "survived",
  };

  for (let day = 1; day <= maxDays; day += 1) {
    state.day = day;
    const crisisImportMultiplier = state.activeCrises.reduce((m, c) => m * (c.importCostMultiplier ?? 1), 1);
    const closed = state.activeCrises.some((c) => c.closedToday);
    const crisisCustomerMultiplier = closed ? 0 : state.activeCrises.reduce((m, c) => m * (c.customerMultiplier ?? 1), 1);
    const eventRain = state.currentEvent === "rainy-day";
    const customers = closed ? [] : generateCustomers(rng, state.products, day, state, {
      rainyDay: eventRain,
      crisisMultiplier: crisisCustomerMultiplier,
    });

    for (const customer of customers) {
      serveCustomer(rng, state, customer, day, crisisImportMultiplier);
    }

    buyOneUpgrade(state, day);
    if (day >= 15 && !state.adRunToday && state.cash > 2500) {
      state.cash -= Math.round((150 + rng() * 350) / 10) * 10;
      state.pendingExtraCustomers = Math.floor(rng() * 3) + 3;
      state.adRunToday = true;
    }
    restockForTomorrow(state, day, crisisImportMultiplier);

    const opCost = getOperatingCost(rng, day);
    state.cash -= opCost;
    if (state.cash < 0) {
      state.failureReason = "bankrupt";
      return state;
    }

    const spoilage = applySpoilage(state.products, state.upgrades.freezer);
    state.products = getUnlockedProducts(day + 1, spoilage.products);
    state.stats.spoilageLossValue += spoilage.lossValue;
    const event = maybeCreateEvent(rng, day + 1, state.products);
    state.currentEvent = event.id;
    if (event.id) state.stats.events[event.id] = (state.stats.events[event.id] ?? 0) + 1;
    state.products = applyEventToProducts(state.products, event, state.upgrades.freezer);
    state.cash += event.cashDelta;
    if (state.cash < 0) {
      state.failureReason = event.id === "thief" ? "stolen" : "bankrupt";
      return state;
    }

    state.adRunToday = false;
    rollGodMode(rng, state, day + 1);
    if (state.cash < 0) {
      state.failureReason = "god_mode_bankrupt";
      return state;
    }
    for (const snapshotDay of SNAPSHOT_DAYS) {
      if (day === snapshotDay) state.snapshots[snapshotDay] = Math.round(state.cash);
    }
  }

  return state;
}

function summarize(results, args) {
  const deathDays = results.map((run) => run.failureReason === "survived" ? args.days : run.day);
  const survived = results.filter((run) => run.failureReason === "survived").length;
  const reasons = {};
  const crisisCounts = {};
  const eventCounts = {};

  for (const run of results) {
    reasons[run.failureReason] = (reasons[run.failureReason] ?? 0) + 1;
    for (const [id, count] of Object.entries(run.stats.crises)) crisisCounts[id] = (crisisCounts[id] ?? 0) + count;
    for (const [id, count] of Object.entries(run.stats.events)) eventCounts[id] = (eventCounts[id] ?? 0) + count;
  }

  const cashByDay = Object.fromEntries(SNAPSHOT_DAYS.map((day) => [
    day,
    Math.round(mean(results.map((run) => run.snapshots[day]).filter((value) => value !== undefined))),
  ]));
  const upgradeDays = {};
  for (const id of Object.keys(UPGRADE_DEFS)) {
    for (let level = 1; level <= MAX_UPGRADE_LEVEL; level += 1) {
      const days = results
        .map((run) => run.stats.upgrades.find((upgrade) => upgrade.id === id && upgrade.level === level)?.day)
        .filter((day) => day !== undefined);
      upgradeDays[`${id}_lv${level}`] = days.length ? Math.round(mean(days)) : null;
    }
  }

  return {
    config: args,
    runs: results.length,
    survived,
    survivalRate: survived / results.length,
    averageFinalDay: mean(deathDays),
    medianFinalDay: percentile(deathDays, 0.5),
    p10FinalDay: percentile(deathDays, 0.1),
    p90FinalDay: percentile(deathDays, 0.9),
    averageCash: Math.round(mean(results.map((run) => run.cash))),
    averageRevenue: Math.round(mean(results.map((run) => run.totalRevenue))),
    averageProfit: Math.round(mean(results.map((run) => run.totalProfit))),
    averageServed: Math.round(mean(results.map((run) => run.stats.served))),
    averageSkipped: Math.round(mean(results.map((run) => run.stats.skipped))),
    averageImportSpend: Math.round(mean(results.map((run) => run.stats.importSpend))),
    averageSpoilageLossValue: Math.round(mean(results.map((run) => run.stats.spoilageLossValue))),
    averageTips: Math.round(mean(results.map((run) => run.stats.tips))),
    cashByDay,
    failureReasons: reasons,
    averageUpgradePurchaseDay: upgradeDays,
    eventCounts,
    crisisCounts,
  };
}

function printReport(summary) {
  console.log(`Homefarm balance simulation`);
  console.log(`Runs: ${summary.runs} | Days: ${summary.config.days} | Seed: ${summary.config.seed}`);
  console.log(`Survival: ${(summary.survivalRate * 100).toFixed(1)}% (${summary.survived}/${summary.runs})`);
  console.log(`Final day: avg ${summary.averageFinalDay.toFixed(1)} | p10 ${summary.p10FinalDay} | median ${summary.medianFinalDay} | p90 ${summary.p90FinalDay}`);
  console.log(`Averages: cash ${money(summary.averageCash)} | revenue ${money(summary.averageRevenue)} | profit ${money(summary.averageProfit)} | served ${summary.averageServed} | skipped ${summary.averageSkipped}`);
  console.log(`Costs: imports ${money(summary.averageImportSpend)} | spoilage value ${money(summary.averageSpoilageLossValue)} | tips ${money(summary.averageTips)}`);
  console.log("");
  console.log("Average cash snapshots:");
  for (const [day, cash] of Object.entries(summary.cashByDay)) {
    if (Number.isFinite(cash) && cash !== 0) console.log(`  Day ${day.padStart(2, " ")}: ${money(cash)}`);
  }
  console.log("");
  console.log("Failure reasons:");
  for (const [reason, count] of Object.entries(summary.failureReasons).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${reason}: ${count} (${((count / summary.runs) * 100).toFixed(1)}%)`);
  }
  console.log("");
  console.log("Average upgrade purchase day:");
  for (const [key, day] of Object.entries(summary.averageUpgradePurchaseDay)) {
    if (day !== null) console.log(`  ${key}: day ${day}`);
  }
  if (Object.keys(summary.crisisCounts).length > 0) {
    console.log("");
    console.log("God Mode crisis rolls:");
    for (const [id, count] of Object.entries(summary.crisisCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${id}: ${count}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const results = Array.from({ length: args.runs }, (_, index) => simulateRun(args.seed + index, args.days));
  const summary = summarize(results, args);
  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }
  printReport(summary);
}

main();

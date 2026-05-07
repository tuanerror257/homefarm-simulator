"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EndDaySummaryData, MascotState, OperatingCostBreakdown, Product, ShopEvent, ShopUpgradeId, ShopUpgrades } from "@/types/homefarm-shop";
import { MASCOT_ASSETS, MASCOT_TALK, START_PRODUCTS } from "@/lib/homefarm-shop/data";
import { GAME_VERSION } from "@/config/version";
import {
  applyEventToProducts,
  applyOvernightSpoilage,
  calcTipRate,
  calculateScore,
  generateCustomers,
  getStockShortageMessage,
  getUnlockedProducts,
  maybeCreateEvent,
  money,
  qty,
} from "@/lib/homefarm-shop/gameUtils";
import { fetchLeaderboard, getLeaderboardMode, saveLeaderboardEntry, type LeaderboardEntry } from "@/lib/homefarm-shop/leaderboard";
import { sfx, setSfxMuted } from "@/lib/homefarm-shop/sfx";
import EndDaySummary from "./EndDaySummary";
import "./homefarm-shop.css";

type OrderProduct = Product & { wantQty: number };

const PAGE_SIZE = 8;
const APP_ORDER_SHIPPING_FEE = 20;
const PRODUCT_EXPANSION_DAY = 6;
const UPGRADE_UNLOCK_DAY = 8;
const EVENT_UNLOCK_DAY = 12;
const AD_UNLOCK_DAY = 15;
// Bot gate: minimum day required to purchase each upgrade level (index = currentLevel)
const BOT_UPGRADE_DAY_GATE = [8, 14, 22];

const AD_TYPES = [
  {
    id: "leaflet" as const,
    icon: "📄",
    name: "Phát tờ rơi",
    desc: "In và phát tờ rơi quanh khu phố.",
    costMin: 150, costMax: 500,
    extraMin: 3, extraMax: 5,
  },
  {
    id: "facebook" as const,
    icon: "📘",
    name: "Quảng cáo Facebook",
    desc: "Nhắm đúng khách hàng mục tiêu trong bán kính 5km.",
    costMin: 350, costMax: 800,
    extraMin: 4, extraMax: 6,
  },
] as const;

type AdId = typeof AD_TYPES[number]["id"];
const MAX_UPGRADE_LEVEL = 3;
const OPERATING_COST_TIERS = [
  { untilDay: 5,        rent: 200, staff: 150, utilities: 30,  otherMin: 10, otherMax: 50  },
  { untilDay: 11,       rent: 280, staff: 250, utilities: 70,  otherMin: 30, otherMax: 80  },
  { untilDay: Infinity, rent: 350, staff: 400, utilities: 100, otherMin: 50, otherMax: 150 },
] as const;

function getOperatingCost(day: number): OperatingCostBreakdown {
  const tier = OPERATING_COST_TIERS.find((t) => day <= t.untilDay) ?? OPERATING_COST_TIERS[OPERATING_COST_TIERS.length - 1];
  const other = Math.round((Math.random() * (tier.otherMax - tier.otherMin) + tier.otherMin) / 10) * 10;
  const total = tier.rent + tier.staff + tier.utilities + other;
  return { rent: tier.rent, staff: tier.staff, utilities: tier.utilities, other, total };
}

const INITIAL_UPGRADES: ShopUpgrades = {
  freezer: 0,
  knife: 0,
  sign: 0,
  staff: 0,
};

const UPGRADE_DEFS: Array<{
  id: ShopUpgradeId;
  icon: string;
  name: string;
  description: string;
  effect: string;
  costs: number[];
}> = [
  {
    id: "knife",
    icon: "🔪",
    name: "Dao fillet",
    description: "Fillet cá nguyên ra nhiều thành phẩm hơn.",
    effect: "+0,35kg fillet và +0,1kg đầu xương mỗi level",
    costs: [500, 1100, 2200],
  },
  {
    id: "staff",
    icon: "🧑‍🍳",
    name: "Nhân viên phụ",
    description: "Khách kiên nhẫn hơn từ ngày kế tiếp.",
    effect: "+2,5s kiên nhẫn mỗi level",
    costs: [800, 1600, 3200],
  },
  {
    id: "sign",
    icon: "💎",
    name: "Bảng hiệu VIP",
    description: "Tăng xác suất gặp khách VIP từ ngày kế tiếp.",
    effect: "+3,5% cơ hội VIP mỗi level",
    costs: [700, 1400, 2800],
  },
  {
    id: "freezer",
    icon: "❄️",
    name: "Tủ lạnh xịn",
    description: "Giảm hao hụt hàng khi gặp sự kiện xấu.",
    effect: "-25% hao hụt do event mỗi level",
    costs: [650, 1300, 2600],
  },
];

export function HomefarmShopGame() {
  const [gamePhase, setGamePhase] = useState<"start" | "tutorial" | "playing">("start");
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/homefarm-shop/bgm.mp3");
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    setSfxMuted(muted);
  }, [muted]);

  function startBgm() {
    audioRef.current?.play().catch(() => {});
  }
  const [products, setProducts] = useState(START_PRODUCTS);
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(1000);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const [servedTodayCount, setServedTodayCount] = useState(0);
  const [skippedTodayCount, setSkippedTodayCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [dayMaxCombo, setDayMaxCombo] = useState(0);
  const [customers, setCustomers] = useState(() => generateCustomers(START_PRODUCTS, 1));
  const [customerIndex, setCustomerIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(customers[0].patience);
  const [toast, setToast] = useState("Tap từng món khách cần mua trên kệ hàng");
  const [showImport, setShowImport] = useState(false);
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showCatalogUnlock, setShowCatalogUnlock] = useState(false);
  const [showUpgradeUnlock, setShowUpgradeUnlock] = useState(false);
  const [showEventUnlock, setShowEventUnlock] = useState(false);
  const [showAdUnlock, setShowAdUnlock] = useState(false);
  const [showAds, setShowAds] = useState(false);
  const [adRunToday, setAdRunToday] = useState<AdId | null>(null);
  const [pendingExtraCustomers, setPendingExtraCustomers] = useState(0);
  const [importQty, setImportQty] = useState<Record<string, number>>({});
  const [upgrades, setUpgrades] = useState<ShopUpgrades>(INITIAL_UPGRADES);
  const [combo, setCombo] = useState(0);
  const [moodScore, setMoodScore] = useState(100);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [mascotState, setMascotState] = useState<MascotState>("idle");
  const [productPage, setProductPage] = useState(0);
  const [activeEvent, setActiveEvent] = useState<ShopEvent | null>(null);
  const [eventMoodPenalty, setEventMoodPenalty] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState("Tada");
  const [botMode, setBotMode] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [daySummary, setDaySummary] = useState<EndDaySummaryData | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<"" | "bankrupt" | "stolen" | "reputation">("");
  const [lowRatingStreak, setLowRatingStreak] = useState(0);

  const customer = customers[customerIndex] || null;
  const botActive = botMode && gamePhase === "playing";

  // Refs so bot setTimeout always reads latest state
  const botProductsRef = useRef(products);
  botProductsRef.current = products;
  const botCashRef = useRef(cash);
  botCashRef.current = cash;
  const botUpgradesRef = useRef(upgrades);
  botUpgradesRef.current = upgrades;
  // Target quantities bot wants to import (set before opening modal, read tick-by-tick)
  const botImportTargetRef = useRef<Record<string, number>>({});
  const botImportQtyRef = useRef(importQty);
  botImportQtyRef.current = importQty;
  // Tracks whether bot has scrolled to confirm button — must be state to trigger re-render
  const [botImportScrolled, setBotImportScrolled] = useState(false);
  const botImportConfirmRef = useRef<HTMLButtonElement>(null);
  // Limits bot to 1 upgrade purchase per day
  const [botUpgradedToday, setBotUpgradedToday] = useState(false);
  const orderProducts: OrderProduct[] = useMemo(
    () =>
      customer
        ? customer.order.map((order) => ({ ...products.find((p) => p.id === order.id)!, wantQty: order.qty }))
        : [],
    [customer, products],
  );

  const done = customer ? customer.order.filter((o) => selected.includes(o.id)).length : 0;
  const totalCustomers = customers.length;
  const servedToday = Math.min(customerIndex, totalCustomers);
  const isComplete = Boolean(customer && done === customer.order.length);
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const visibleProducts = products.slice(productPage * PAGE_SIZE, productPage * PAGE_SIZE + PAGE_SIZE);

  botCashRef.current = cash;

  const bill = useMemo(() => orderProducts.reduce((s, p) => s + p.price * p.wantQty, 0), [orderProducts]);
  const orderProfit = useMemo(() => orderProducts.reduce((s, p) => s + (p.price - p.cost) * p.wantQty, 0), [orderProducts]);
  const timePercent = customer ? Math.max(0, Math.round((timeLeft / customer.patience) * 100)) : 0;
  const estimatedTip = customer ? bill * calcTipRate(customer, timeLeft, moodScore, combo) : 0;
  const importCost = products.reduce((s, p) => s + (importQty[p.id] || 0) * p.cost, 0);
  const upgradesUnlocked = day >= UPGRADE_UNLOCK_DAY;
  const upgradeCount = Object.values(upgrades).reduce((sum, level) => sum + level, 0);

  const currentScore = calculateScore({
    day,
    cash,
    totalRevenue,
    totalProfit,
    servedCount,
    maxCombo,
  });

  const comboMultiplier = combo >= 10 ? 2 : combo >= 5 ? 1.5 : combo >= 3 ? 1.2 : 1;
  const comboLabel = combo > 0 ? `x${comboMultiplier}` : "x1";

  const skipCustomer = useCallback((msg: string, countAsSkipped = true) => {
    setSelected([]);
    if (countAsSkipped) setSkippedTodayCount((value) => value + 1);
    if (customerIndex >= customers.length - 1) {
      setCustomerIndex(customers.length);
      setToast("Hết khách hôm nay. Bấm Qua ngày để sang ngày mới.");
    } else {
      setCustomerIndex((v) => v + 1);
      setToast(msg);
    }
  }, [customerIndex, customers.length]);

  useEffect(() => {
    if (gameOver) { sfx.gameOver(); saveScore(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  useEffect(() => {
    if (!customer) {
      // Customer transitions intentionally reset transient round state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMascotState("happy");
      return;
    }
    setTimeLeft(customer.patience);
    setMoodScore(Math.max(10, 100 + eventMoodPenalty));
    setSelected([]);
    setMascotState(customer.repeat ? "trust" : "idle");
  }, [customerIndex, day, customer, eventMoodPenalty]);

  useEffect(() => {
    if (gamePhase !== "playing" || !customer || showImport || showUpgrades || showCatalogUnlock || showUpgradeUnlock || showEventUnlock || showAdUnlock || showAds || showLeaderboard || activeEvent || gameOver) return;

    const timer = setInterval(() => {
      setMoodScore((m) => Math.max(0, m - (0.7 + day * 0.022) * 2.2));
      setTimeLeft((t) => {
        if (t <= 1) {
          sfx.fail();
          setCombo(0);
          setMascotState("fail");
          skipCustomer("Khách chờ lâu quá nên bỏ đi 😭 Combo reset.");
          return 0;
        }

        if (t / customer.patience < 0.3) setMascotState("hurry");
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, customerIndex, customer, showImport, showUpgrades, showCatalogUnlock, showUpgradeUnlock, showEventUnlock, showAdUnlock, showAds, showLeaderboard, activeEvent, day, skipCustomer]);

  async function loadLeaderboard() {
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch {
      setToast("Không tải được leaderboard. Kiểm tra Supabase/env nhé.");
    }
  }

  function tapProduct(id: string) {
    if (!customer) return;

    if (!customer.order.some((o) => o.id === id)) {
      sfx.wrong();
      setCash((v) => Math.max(0, v - 50));
      setMoodScore((m) => Math.max(0, m - 15));
      setCombo(0);
      setMascotState("wrong");
      setWrongFlash(true);
      window.setTimeout(() => setWrongFlash(false), 260);
      setToast("Chọn sai món! -50k, mood giảm, combo reset 😤");
      return;
    }

    if (!selected.includes(id)) sfx.tap();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setMoodScore((m) => Math.min(100, m + 4));
    setMascotState(combo >= 2 ? "combo" : "happy");
    setToast(combo > 0 ? `Đúng món! Giữ nhịp combo ${comboLabel} 🔥` : "Đã chọn đúng món. Mood +4");
  }

  function deliver() {
    if (!customer) {
      setToast("Hết khách rồi. Bấm Qua ngày để sang ngày mới.");
      return;
    }

    if (!isComplete) {
      setMascotState("idea");
      setMoodScore((m) => Math.max(0, m - 3));
      setToast("Chưa đủ món trong order, chọn tiếp đã bro. Mood -3");
      return;
    }

    const notEnough = orderProducts.find((p) => p.stock < p.wantQty);
    if (notEnough) {
      sfx.wrong();
      setCombo(0);
      setMoodScore((m) => Math.max(0, m - 12));
      setMascotState("thinking");
      setWrongFlash(true);
      window.setTimeout(() => setWrongFlash(false), 260);
      setToast(`${getStockShortageMessage(notEnough)} Combo reset.`);
      return;
    }

    const speedRatio = timeLeft / customer.patience;
    const baseTip = bill * calcTipRate(customer, timeLeft, moodScore, combo);
    const nextCombo = speedRatio > 0.45 && moodScore >= 40 ? combo + 1 : 0;
    const nextMultiplier = nextCombo >= 10 ? 2 : nextCombo >= 5 ? 1.5 : nextCombo >= 3 ? 1.2 : 1;
    const comboBonus = nextCombo >= 3 ? Math.round(bill * (nextMultiplier - 1) * 0.04) : 0;
    const tip = Math.round(baseTip);
    const shippingFee = customer.appOrder ? APP_ORDER_SHIPPING_FEE : 0;
    const thisOrderProfit = orderProfit + tip + comboBonus - shippingFee;

    setProducts((prev) =>
      prev.map((p) => {
        const o = customer.order.find((x) => x.id === p.id);
        return o ? { ...p, stock: Number((p.stock - o.qty).toFixed(1)) } : p;
      }),
    );

    setCash((v) => v + bill + tip + comboBonus - shippingFee);
    setRevenue((v) => v + bill);
    setProfit((v) => v + thisOrderProfit);
    setTotalRevenue((v) => v + bill);
    setTotalProfit((v) => v + thisOrderProfit);
    setServedCount((v) => v + 1);
    setServedTodayCount((v) => v + 1);
    setCombo(nextCombo);
    setMaxCombo((v) => Math.max(v, nextCombo));
    setDayMaxCombo((v) => Math.max(v, nextCombo));
    setMoodScore((m) => Math.min(100, m + (nextCombo >= 3 ? 7 : 4)));
    setMascotState(nextCombo >= 3 ? "combo" : "happy");
    sfx.deliver();
    if (nextCombo >= 3) sfx.combo(nextCombo);

    let msg = `Chuẩn! Bill +${money(bill)} · Lãi ${money(thisOrderProfit)}`;
    if (tip > 0) msg += ` · Tip +${money(tip)}`;
    if (comboBonus > 0) msg += ` · Bonus +${money(comboBonus)}`;
    if (shippingFee > 0) msg += ` · Phí ship -${money(shippingFee)}`;
    if (nextCombo >= 3) msg += ` · Combo ${nextCombo} (${nextMultiplier}x) 🔥`;
    else if (nextCombo > 0) msg += ` · Combo ${nextCombo}`;
    if (customer.vip) msg += " · VIP tip mạnh 💎";
    else if (customer.repeat) msg += " · Khách quen 🔁";

    skipCustomer(msg, false);
  }

  function fillet() {
    const whole = products.find((p) => p.id === "wholeSalmon");
    if (!whole || whole.stock < 1) {
      sfx.wrong();
      setMascotState("thinking");
      setToast("Không đủ cá nguyên con để fillet. Cần nhập thêm cá nguyên.");
      return;
    }
    sfx.knife();

    const salmonYield = 4.8 + upgrades.knife * 0.35;
    const headBoneYield = 1.2 + upgrades.knife * 0.1;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === "wholeSalmon"
          ? { ...p, stock: Number((p.stock - 1).toFixed(1)) }
          : p.id === "salmon"
            ? { ...p, stock: Number((p.stock + salmonYield).toFixed(1)) }
            : p.id === "headBone"
              ? { ...p, stock: Number((p.stock + headBoneYield).toFixed(1)) }
              : p,
      ),
    );

    setMascotState("trust");
    setToast(`Fillet 1 con cá nguyên: +${qty(salmonYield)}kg fillet, +${qty(headBoneYield)}kg đầu xương.`);
  }

  function buyUpgrade(id: ShopUpgradeId) {
    if (!upgradesUnlocked) {
      setToast(`Nâng cấp cửa hàng sẽ mở từ ngày ${UPGRADE_UNLOCK_DAY}.`);
      return;
    }

    const definition = UPGRADE_DEFS.find((upgrade) => upgrade.id === id)!;
    const currentLevel = upgrades[id];
    if (currentLevel >= MAX_UPGRADE_LEVEL) {
      setToast(`${definition.name} đã đạt level tối đa.`);
      return;
    }

    const cost = definition.costs[currentLevel];
    if (cash < cost) {
      setMascotState("thinking");
      setToast(`Chưa đủ tiền nâng cấp ${definition.name}. Cần ${money(cost)}, hiện có ${money(cash)}.`);
      return;
    }

    sfx.cash();
    setCash((value) => value - cost);
    setUpgrades((current) => ({ ...current, [id]: current[id] + 1 }));
    setMascotState("trust");
    setToast(`Đã nâng cấp ${definition.name} lên level ${currentLevel + 1}: -${money(cost)}.`);
  }

  function setQty(id: string, value: number) {
    setImportQty((prev) => ({ ...prev, [id]: Math.max(0, Number(value) || 0) }));
  }

  function confirmImport() {
    if (importCost <= 0) {
      setMascotState("idea");
      setToast("Chọn số lượng cần nhập trước đã bro.");
      return;
    }

    if (cash < importCost) {
      setMascotState("thinking");
      setToast(`Không đủ tiền nhập. Cần ${money(importCost)}, hiện có ${money(cash)}.`);
      return;
    }

    sfx.cash();
    setCash((v) => v - importCost);
    setProducts((prev) =>
      prev.map((p) => ({ ...p, stock: Number((p.stock + (importQty[p.id] || 0)).toFixed(1)) })),
    );
    setImportQty({});
    setShowImport(false);
    setMascotState("trust");
    setToast(`Đã nhập hàng: -${money(importCost)} tiền vốn. Lưu ý: lãi lũy kế chỉ tính từ đơn đã bán.`);
  }

  function endDay() {
    const remaining = Math.max(0, customers.length - customerIndex);
    const skippedTotal = skippedTodayCount + remaining;
    // Rating chỉ tính khách bị bỏ qua (timer hết / hết hàng), không phạt khách chưa tới lượt
    const rating = Math.max(
      1,
      Math.min(5, Number((5 - skippedTodayCount * 0.35 + servedTodayCount * 0.08).toFixed(1))),
    );
    const opCost = getOperatingCost(day);

    setDaySummary({
      revenue,
      profit,
      served: servedTodayCount,
      total: customers.length,
      skipped: skippedTotal,
      combo: dayMaxCombo,
      rating,
      operatingCost: opCost,
      cashAfterCost: cash - opCost.total,
    });
  }

  // ── BOT (Tadadev mode) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!botActive) return;

    // Compute delay based on current UI state
    let delay = 650;
    if (daySummary) {
      delay = 2000;
    } else if (showCatalogUnlock || showUpgradeUnlock || showEventUnlock || showAdUnlock) {
      delay = 3500; // pause on unlock notification screens so user can read
    } else if (showUpgrades || showAds) {
      delay = 1500; // pause so user can read modal before bot acts
    } else if (showImport) {
      const targetEntries = Object.entries(botImportTargetRef.current);
      if (targetEntries.length > 0) {
        const anyFilled = targetEntries.some(([id]) => (importQty[id] || 0) > 0);
        const allFilled = targetEntries.every(([id, need]) => (importQty[id] || 0) >= need);
        // After all filled: 1s to see scroll-to-confirm, then 800ms before clicking confirm
        delay = allFilled ? (botImportScrolled ? 800 : 1000)
              : anyFilled ? 150   // fast +1 clicks while filling
              : 1500;             // first pause after modal opens (shows empty form)
      }
    }

    const t = setTimeout(() => {
      const curProducts = botProductsRef.current;
      const curCash = botCashRef.current;
      const curUpgrades = botUpgradesRef.current;

      // 1. Dismiss blocking overlays bot never intentionally opens
      if (showCatalogUnlock) { setShowCatalogUnlock(false); return; }
      if (showUpgradeUnlock) { setShowUpgradeUnlock(false); return; }
      if (showEventUnlock)   { setShowEventUnlock(false);   return; }
      if (showAdUnlock)      { setShowAdUnlock(false);      return; }
      if (activeEvent)       { setActiveEvent(null);        return; }

      // 2. Game over → restart after 3s
      if (gameOver) { setTimeout(resetGame, 3000); return; }

      // 3. End-day summary → advance
      if (daySummary) { startNextDay(); return; }

      // 4. No customer → upgrade / ads / refill / end day
      if (!customer) {
        // Upgrade modal open → buy the one upgrade bot decided on, then close immediately
        if (showUpgrades) {
          const upgradeOrder: ShopUpgradeId[] = ["staff", "freezer", "sign", "knife"];
          for (const upId of upgradeOrder) {
            const level = curUpgrades[upId];
            if (level >= MAX_UPGRADE_LEVEL) continue;
            if (day < BOT_UPGRADE_DAY_GATE[level]) continue;
            const cost = UPGRADE_DEFS.find((u) => u.id === upId)!.costs[level];
            if (curCash >= cost * 2) { buyUpgrade(upId); setShowUpgrades(false); return; }
          }
          setShowUpgrades(false);
          return;
        }

        // Ads modal open → run leaflet ad
        if (showAds) { runAd(AD_TYPES[0]); return; }

        // Import modal open → scroll to product row, increment +1 per tick, then scroll to confirm
        if (showImport) {
          const target = botImportTargetRef.current;
          const curQty = botImportQtyRef.current;
          const nextEntry = Object.entries(target).find(([id, need]) => (curQty[id] || 0) < need);
          if (nextEntry) {
            const [id] = nextEntry;
            document.querySelector(`[data-import-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            setImportQty((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
            return;
          }
          // All filled — scroll to confirm button first, then confirm on next tick
          if (!botImportScrolled) {
            botImportConfirmRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            setBotImportScrolled(true); // triggers re-render so effect re-fires
            return;
          }
          setBotImportScrolled(false);
          confirmImport();
          return;
        }

        // Decide: open upgrade modal — max 1 upgrade per day, gated by day milestone per level
        if (upgradesUnlocked && !botUpgradedToday) {
          const upgradeOrder: ShopUpgradeId[] = ["staff", "freezer", "sign", "knife"];
          for (const upId of upgradeOrder) {
            const level = curUpgrades[upId];
            if (level >= MAX_UPGRADE_LEVEL) continue;
            if (day < BOT_UPGRADE_DAY_GATE[level]) continue; // not yet time for this level
            const cost = UPGRADE_DEFS.find((u) => u.id === upId)!.costs[level];
            if (curCash >= cost * 2) { // keep at least 1× cost as buffer after purchase
              setBotUpgradedToday(true);
              setShowUpgrades(true);
              return;
            }
          }
        }

        // Decide: open ads modal once per day if affordable
        // 2500k buffer = max opCost(1000) + max leaflet(500) + 1000 safety
        if (day >= AD_UNLOCK_DAY && !adRunToday && curCash > 2500) {
          setShowAds(true);
          return;
        }

        // Demand-based broad refill: estimate next day's consumption per product
        {
          const nextDay = day + 1;
          // Mirror customersCountByDay formula from gameUtils
          const nextCustomers = nextDay <= 5
            ? 3 + nextDay
            : Math.min(8 + Math.floor((nextDay - 5) * 0.55), 18);
          // Average items per order, increasing with day
          const avgItems = nextDay <= 8 ? 2 : nextDay <= 16 ? 3.5 : 4.5;
          // Importable products excluding wholeSalmon (handled by fillet + spot import)
          const importable = curProducts.filter((p) => p.cost > 0 && p.id !== "wholeSalmon");
          const orderProb = Math.min(0.9, avgItems / Math.max(1, importable.length));

          const refillQty: Record<string, number> = {};
          let refillCost = 0;
          for (const p of importable) {
            // Avg qty ordered per visit, by product category
            const avgQty =
              ["egg","sausage","cheese","milk","butter","yogurt","bacon","ham","bread"].includes(p.id) ? 2
              : ["cherry","strawberry"].includes(p.id) ? 0.7
              : ["grape","avocado","kiwi","mango","orange"].includes(p.id) ? 1.2
              : p.id === "blueberry" ? 1.5
              : 0.9; // seafood, meat (kg)

            const expectedDemand = nextCustomers * orderProb * avgQty;
            const target = Math.max(2, Math.ceil(expectedDemand * 1.3)); // 30% safety buffer
            const need = Math.max(0, target - p.stock);
            if (need > 0) {
              refillQty[p.id] = need;
              refillCost += need * p.cost;
            }
          }

          const CASH_RESERVE = 2000; // always keep 2000k after restocking
          if (refillCost > 0 && curCash - refillCost >= CASH_RESERVE) {
            botImportTargetRef.current = refillQty;
            setBotImportScrolled(false);
            setImportQty({});
            setShowImport(true);
            return;
          }
        }
        endDay();
        return;
      }

      // 5. Has customer — import modal open → scroll + increment +1 per tick, scroll to confirm
      if (showImport) {
        const target = botImportTargetRef.current;
        const curQty = botImportQtyRef.current;
        const nextEntry = Object.entries(target).find(([id, need]) => (curQty[id] || 0) < need);
        if (nextEntry) {
          const [id] = nextEntry;
          document.querySelector(`[data-import-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          setImportQty((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
          return;
        }
        if (!botImportScrolled) {
          botImportConfirmRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
          setBotImportScrolled(true);
          return;
        }
        setBotImportScrolled(false);
        confirmImport();
        return;
      }

      // 6. Fix stock shortages
      const shortItems = customer.order.filter((item) => {
        const p = curProducts.find((pr) => pr.id === item.id);
        return (p?.stock ?? 0) < item.qty;
      });

      if (shortItems.length > 0) {
        // Try filleting wholeSalmon first if salmon/headBone is short
        const needsFillet = shortItems.some((s) => s.id === "salmon" || s.id === "headBone");
        if (needsFillet) {
          const wholeStock = curProducts.find((p) => p.id === "wholeSalmon")?.stock ?? 0;
          if (wholeStock >= 1) { fillet(); return; }
        }

        // Record import targets then open empty modal
        const importItems: Record<string, number> = {};
        let totalImportCost = 0;
        for (const p of curProducts) {
          const short = shortItems.find((s) => s.id === p.id);
          if (!short || p.cost <= 0) continue;
          const need = Math.ceil(short.qty - p.stock) + 3;
          importItems[p.id] = need;
          totalImportCost += need * p.cost;
        }
        if (totalImportCost > 0 && curCash >= totalImportCost) {
          botImportTargetRef.current = importItems;
          setBotImportScrolled(false);
          setImportQty({});
          setShowImport(true);
          return;
        }
        skipCustomer("🤖 Bot bỏ qua — không đủ tiền nhập hàng.");
        return;
      }

      // 7. Navigate to the correct product page before tapping
      const nextItem = customer.order.find((item) => !selected.includes(item.id));
      if (nextItem) {
        const productIndex = curProducts.findIndex((p) => p.id === nextItem.id);
        const targetPage = Math.max(0, Math.floor(productIndex / PAGE_SIZE));
        if (targetPage !== productPage) { setProductPage(targetPage); return; }
        tapProduct(nextItem.id);
        return;
      }

      // 8. All items selected → deliver
      if (isComplete) { deliver(); return; }
      skipCustomer("🤖 Bot bỏ qua.");
    }, delay);

    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    botActive,
    showCatalogUnlock, showUpgradeUnlock, showEventUnlock, showAdUnlock,
    showImport, showUpgrades, showAds, activeEvent,
    gameOver, daySummary, customer, selected, isComplete,
    upgrades, adRunToday, day, products, productPage, importQty, botImportScrolled, botUpgradedToday,
  ]);
  // ── END BOT ─────────────────────────────────────────────────────────────────

  function runAd(type: typeof AD_TYPES[number]) {
    const cost = Math.round((Math.random() * (type.costMax - type.costMin) + type.costMin) / 10) * 10;
    const extra = Math.floor(Math.random() * (type.extraMax - type.extraMin + 1)) + type.extraMin;
    if (cash < cost) {
      setToast(`Không đủ tiền chạy ${type.name}.`);
      return;
    }
    setCash((c) => c - cost);
    setPendingExtraCustomers(extra);
    setAdRunToday(type.id);
    setShowAds(false);
    sfx.cash();
    setToast(`📣 Đã chạy ${type.name} · -${money(cost)} · ngày mai thêm ${extra} khách.`);
  }

  function startNextDay() {
    const remainingCustomers = Math.max(0, customers.length - customerIndex);
    const nextDay = day + 1;
    const opTotal = daySummary?.operatingCost?.total ?? 0;
    const cashAfterCost = cash - opTotal;

    const overnightSpoilage = applyOvernightSpoilage(products, { freezerLevel: upgrades.freezer });
    const unlockedProducts = getUnlockedProducts(nextDay, overnightSpoilage.products);
    const nextEvent = maybeCreateEvent(nextDay, unlockedProducts);
    const nextProducts = applyEventToProducts(unlockedProducts, nextEvent, { freezerLevel: upgrades.freezer });
    const nextCustomers = generateCustomers(nextProducts, nextDay, {
      signLevel: upgrades.sign,
      staffLevel: upgrades.staff,
      rainyDay: nextEvent?.id === "rainy-day",
      extraCount: pendingExtraCustomers,
    });

    if (cashAfterCost < 0) {
      setCash(cashAfterCost);
      setDaySummary(null);
      setGameOver(true);
      setGameOverReason("bankrupt");
      return;
    }

    const todayRating = daySummary?.rating ?? 5;
    const nextLowRatingStreak = todayRating < 2.0 ? lowRatingStreak + 1 : 0;
    setLowRatingStreak(nextLowRatingStreak);
    if (nextLowRatingStreak >= 3) {
      setDaySummary(null);
      setGameOver(true);
      setGameOverReason("reputation");
      return;
    }

    const cashWithEvent = cashAfterCost + (nextEvent?.cashDelta ?? 0);
    if (cashWithEvent < 0) {
      setCash(cashWithEvent);
      setDaySummary(null);
      setGameOver(true);
      setGameOverReason("stolen");
      return;
    }

    setCash(cashWithEvent);

    setDay(nextDay);
    setRevenue(0);
    setProfit(0);
    setServedTodayCount(0);
    setSkippedTodayCount(0);
    setProducts(nextProducts);
    setCustomers(nextCustomers);
    setCustomerIndex(0);
    setTimeLeft(nextCustomers[0]?.patience ?? 30);
    setMoodScore(100);
    setSelected([]);
    setProductPage(0);
    setCombo(0);
    setDayMaxCombo(0);
    setWrongFlash(false);
    setMascotState("idle");
    setEventMoodPenalty(nextEvent?.moodDelta ?? 0);
    setActiveEvent(nextEvent);
    setDaySummary(null);
    setScoreSaved(false);
    setPendingExtraCustomers(0);
    setAdRunToday(null);
    setBotUpgradedToday(false);
    if (nextDay === PRODUCT_EXPANSION_DAY) setShowCatalogUnlock(true);
    if (nextDay === UPGRADE_UNLOCK_DAY) setShowUpgradeUnlock(true);
    if (nextDay === EVENT_UNLOCK_DAY) setShowEventUnlock(true);
    if (nextDay === AD_UNLOCK_DAY) setShowAdUnlock(true);

    const skippedText = remainingCustomers > 0 ? ` · bỏ qua ${remainingCustomers} khách còn lại` : "";
    const spoilageText = overnightSpoilage.affectedCount > 0 ? ` · hao hụt qua đêm ${overnightSpoilage.affectedCount} mặt hàng` : "";
    const catalogText = nextDay === PRODUCT_EXPANSION_DAY ? " · danh mục sản phẩm đã mở rộng" : "";
    const upgradeText = nextDay === UPGRADE_UNLOCK_DAY ? " · đã mở Nâng cấp cửa hàng" : "";
    const eventText = nextDay === EVENT_UNLOCK_DAY ? " · các vấn đề vận hành bắt đầu xuất hiện" : "";
    const adText = nextDay === AD_UNLOCK_DAY ? " · đã mở Quảng Cáo" : pendingExtraCustomers > 0 ? ` · +${pendingExtraCustomers} khách từ quảng cáo` : "";
    setToast(`Ngày ${nextDay}: mở khóa ${nextProducts.length} mặt hàng · có ${nextCustomers.length} khách${skippedText}${spoilageText}${catalogText}${upgradeText}${eventText}${adText}. Combo tốt nhất: ${maxCombo}.`);
  }

  async function saveScore() {
    if (playerName.toLowerCase() === "tadadev") return;
    try {
      await saveLeaderboardEntry({
        player_name: playerName.trim() || "Ẩn danh",
        score: currentScore,
        day_reached: day,
        cash: Math.round(cash),
        total_revenue: Math.round(totalRevenue),
        total_profit: Math.round(totalProfit),
        max_combo: maxCombo,
        served_count: servedCount,
      });
      setScoreSaved(true);
      await loadLeaderboard();
      setToast(getLeaderboardMode() === "supabase" ? "Đã lưu điểm lên Supabase leaderboard." : "Đã lưu điểm local. Kiểm tra .env.local để bật Supabase.");
    } catch {
      setToast("Lưu điểm lỗi. Kiểm tra Supabase table/env nhé.");
    }
  }

  function resetGame() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    const initCustomers = generateCustomers(START_PRODUCTS, 1);
    setGamePhase("start");
    setProducts(START_PRODUCTS);
    setDay(1);
    setCash(1000);
    setRevenue(0);
    setProfit(0);
    setTotalRevenue(0);
    setTotalProfit(0);
    setServedCount(0);
    setServedTodayCount(0);
    setSkippedTodayCount(0);
    setMaxCombo(0);
    setDayMaxCombo(0);
    setCustomers(initCustomers);
    setCustomerIndex(0);
    setSelected([]);
    setTimeLeft(initCustomers[0].patience);
    setToast("Tap từng món khách cần mua trên kệ hàng");
    setShowImport(false);
    setShowUpgrades(false);
    setShowCatalogUnlock(false);
    setShowUpgradeUnlock(false);
    setShowEventUnlock(false);
    setShowAdUnlock(false);
    setShowAds(false);
    setAdRunToday(null);
    setPendingExtraCustomers(0);
    setImportQty({});
    setUpgrades(INITIAL_UPGRADES);
    setCombo(0);
    setMoodScore(100);
    setWrongFlash(false);
    setMascotState("idle");
    setProductPage(0);
    setActiveEvent(null);
    setEventMoodPenalty(0);
    setShowLeaderboard(false);
    setScoreSaved(false);
    setBotMode(false);
    setDaySummary(null);
    setGameOver(false);
    setGameOverReason("");
    setLowRatingStreak(0);
  }

  if (gamePhase === "start") {
    return (
      <div className="hfs-page">
        <div className="hfs-phone">
          <div className="hfs-bg" />
          <div className="hfs-version-badge">v{GAME_VERSION}</div>
          <StartScreen onStart={() => { startBgm(); setGamePhase("tutorial"); }} />
        </div>
      </div>
    );
  }

  if (gamePhase === "tutorial") {
    return (
      <div className="hfs-page">
        <div className="hfs-phone">
          <div className="hfs-bg" />
          <div className="hfs-version-badge">v{GAME_VERSION}</div>
          <StartScreen onStart={() => {}} dimmed />
          <TutorialModal onConfirm={(name) => { if (name) { setPlayerName(name); setBotMode(name.toLowerCase() === "tadadev"); } setGamePhase("playing"); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="hfs-page">
      <div className={`hfs-phone ${wrongFlash ? "wrong" : ""}`}>
        <div className="hfs-bg" />
        <div className="hfs-version-badge">v{GAME_VERSION}</div>
        {botActive && <div className="hfs-bot-badge">🤖 BOT</div>}
        <button className="hfs-mute-btn" onClick={() => setMuted(m => !m)} aria-label="Toggle music">
          {muted ? "🔇" : "🔊"}
        </button>

        <header className="hfs-header">
          <div className="hfs-brand-art">
            <Image
              src="/homefarm-shop/header-brand.png"
              alt="Homefarm Shop Simulator"
              width={2528}
              height={1684}
              className="hfs-brand-img"
              priority
            />
          </div>

          <div className="hfs-dashboard">
            <div className="hfs-dashboard-main">
              <Hud label="TIỀN MẶT" value={money(cash)} tone="cash" />
              <Hud label="DT LŨY KẾ" value={money(totalRevenue)} tone="revenue" />
              <Hud label="LÃI LŨY KẾ" value={money(totalProfit)} tone="profit" />
            </div>

            <div className="hfs-dashboard-sub">
              <MiniHud label="DAY" value={day} />
              <MiniHud label="DT NGÀY" value={money(revenue)} />
              <MiniHud label="LÃI NGÀY" value={money(profit)} />
            </div>
          </div>
        </header>

        <main className="hfs-main">
          <section className="hfs-customer-zone">
            {customer ? (
              <>
                <MascotPanel state={mascotState} />
                <div className="hfs-order-side">
                  <div className="hfs-order-card">
                    <div className="hfs-order-top">
                      <div className="hfs-order-id">
                        ORDER #{customer.orderNo} · {servedToday + 1}/{totalCustomers}
                      </div>
                      <div className="hfs-order-badges">
                        {customer.vip && <div className="hfs-vip-badge">VIP</div>}
                        {customer.appOrder && <div className="hfs-app-badge">APP</div>}
                        <div className={`hfs-combo ${combo >= 3 ? "hot" : ""}`}>🔥 {combo} · {comboLabel}</div>
                      </div>
                    </div>

                    <div className="hfs-customer-line">
                      <div className="hfs-avatar">{customer.avatar}</div>
                      <div className="hfs-customer-meta">
                        <div className="hfs-customer-name">
                          {customer.name} · {customer.mood}
                        </div>
                        <div className="hfs-quote">“{customer.quote}”</div>
                      </div>
                    </div>

                    <div className="hfs-bars">
                      <Bar label="ORDER" value={`${done}/${customer.order.length}`} percent={(done / customer.order.length) * 100} color="hfs-green" />
                      <Bar label="TIME" value={`${timeLeft}s`} percent={timePercent} color={timePercent > 50 ? "hfs-blue" : timePercent > 25 ? "hfs-yellow" : "hfs-red"} />
                      <Bar label="MOOD" value={`${Math.round(moodScore)}%`} percent={moodScore} color={moodScore > 65 ? "hfs-green" : moodScore > 35 ? "hfs-yellow" : "hfs-red"} />
                    </div>

                    <div className="hfs-bill">
                      Bill {money(bill)} · Lãi {money(orderProfit - (customer.appOrder ? APP_ORDER_SHIPPING_FEE : 0))} · Tip ~{money(estimatedTip)}
                    </div>
                  </div>

                  <div className="hfs-order-items">
                    {orderProducts.map((product) => {
                      const active = selected.includes(product.id);
                      return (
                        <div key={product.id} className={`hfs-order-item ${active ? "active" : ""}`}>
                          <div className="hfs-order-icon">{product.icon}</div>
                          <div className="hfs-order-qty">
                            {qty(product.wantQty)}
                            {product.unit}
                          </div>
                          <div className="hfs-order-qty">{active ? "✓" : "□"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="hfs-end-day">
                <div style={{ fontSize: 42 }}>🏪</div>
                <div style={{ fontWeight: 900, fontSize: 18 }}>Hết khách hôm nay</div>
                <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7, textAlign: "center" }}>
                  DT ngày: {money(revenue)} · Lãi ngày: {money(profit)}
                  <br />
                  DT tổng: {money(totalRevenue)} · Lãi tổng: {money(totalProfit)}
                </div>
              </div>
            )}
          </section>

          <section className="hfs-shelf">
            <div className="hfs-shelf-head">
              <div className="hfs-shelf-top">
                <span>Kệ hàng</span>
                {totalPages > 1 && (
                  <div className="hfs-page-tabs">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        className={`hfs-page-tab ${productPage === index ? "active" : ""}`}
                        onClick={() => setProductPage(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="hfs-shelf-actions">
                <button
                  className="hfs-board-pill"
                  onClick={async () => {
                    setShowLeaderboard(true);
                    await loadLeaderboard();
                  }}
                >
                  🏆 BXH
                </button>
                {upgradesUnlocked && (
                  <button className="hfs-board-pill hfs-upgrade-pill" onClick={() => setShowUpgrades(true)}>
                    ⬆️ Lv {upgradeCount}
                  </button>
                )}
                {day >= AD_UNLOCK_DAY && (
                  <button
                    className={`hfs-board-pill hfs-ad-pill${adRunToday ? " done" : ""}`}
                    onClick={() => { sfx.button(); setShowAds(true); }}
                  >
                    📣{adRunToday ? " ✓" : " Ads"}
                  </button>
                )}
              </div>
            </div>

            <div className="hfs-product-grid">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  active={selected.includes(product.id)}
                  wanted={customer ? customer.order.some((o) => o.id === product.id) : false}
                  onClick={tapProduct}
                />
              ))}
            </div>
          </section>

        </main>

        <div className="hfs-toast">💬 {toast}</div>

        <footer className="hfs-footer">
          <button onClick={fillet} className="hfs-action hfs-fillet">🔪 Fillet</button>
          <button onClick={deliver} className={`hfs-action hfs-deliver ${isComplete ? "ready" : ""}`}>✅ Giao</button>
          <button onClick={() => { sfx.button(); setMascotState("thinking"); setShowImport(true); }} className="hfs-action hfs-import">🚚 Nhập</button>
          <button onClick={() => { sfx.nextDay(); endDay(); }} className="hfs-action hfs-end">🌙 Qua ngày</button>
        </footer>

        {activeEvent && (
          <div className={`hfs-event-card hfs-event-${activeEvent.type}`}>
            <div className="hfs-event-title">⚡ {activeEvent.title}</div>
            <div className="hfs-event-desc">{activeEvent.description}</div>
            <button className="hfs-event-btn" onClick={() => setActiveEvent(null)}>Ok, xử lý luôn</button>
          </div>
        )}

        {showImport && (
          <div className="hfs-modal-backdrop">
            <div className="hfs-modal">
              <div className="hfs-modal-top">
                <div>
                  <div className="hfs-modal-title">Nhập hàng</div>
                  <div className="hfs-modal-sub">Chọn số lượng cần nhập. Tổng vốn: {money(importCost)}</div>
                </div>
                <button onClick={() => setShowImport(false)} className="hfs-modal-close">×</button>
              </div>

              <div className="hfs-import-list">
                {products.filter((p) => p.cost > 0).map((product) => {
                  const q = importQty[product.id] || 0;
                  return (
                    <div key={product.id} className="hfs-import-row" data-import-id={product.id}>
                      <div className="hfs-import-icon">{product.icon}</div>
                      <div className="hfs-import-info">
                        <div className="hfs-import-name">{product.name}</div>
                        <div className="hfs-import-sub">
                          Tồn {qty(product.stock)} {product.unit} · {product.id === "wholeSalmon" ? "1 con = 6kg · Vốn 2.580k/con" : `Vốn ${money(product.cost)}/${product.unit}`}
                        </div>
                      </div>
                      <div className="hfs-stepper">
                        <button onClick={() => { sfx.stepper(); setQty(product.id, q - 1); }} className="hfs-step-minus">−</button>
                        <div className="hfs-step-value">{q}</div>
                        <button onClick={() => { sfx.stepper(); setQty(product.id, q + 1); }} className="hfs-step-plus">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hfs-modal-actions">
                <button onClick={() => setShowImport(false)} className="hfs-cancel">Huỷ</button>
                <button ref={botImportConfirmRef} onClick={confirmImport} className="hfs-confirm">Nhập {money(importCost)}</button>
              </div>
            </div>
          </div>
        )}

        {showUpgrades && (
          <div className="hfs-modal-backdrop">
            <div className="hfs-modal">
              <div className="hfs-modal-top">
                <div>
                  <div className="hfs-modal-title">Nâng cấp cửa hàng</div>
                  <div className="hfs-modal-sub">Dùng tiền mặt để mở lợi thế dài hạn. Tổng level: {upgradeCount}/{UPGRADE_DEFS.length * MAX_UPGRADE_LEVEL}</div>
                </div>
                <button onClick={() => setShowUpgrades(false)} className="hfs-modal-close">×</button>
              </div>

              <div className="hfs-upgrade-list">
                {UPGRADE_DEFS.map((upgrade) => {
                  const level = upgrades[upgrade.id];
                  const maxed = level >= MAX_UPGRADE_LEVEL;
                  const cost = maxed ? 0 : upgrade.costs[level];
                  return (
                    <div key={upgrade.id} className={`hfs-upgrade-row ${maxed ? "maxed" : ""}`}>
                      <div className="hfs-import-icon">{upgrade.icon}</div>
                      <div className="hfs-import-info">
                        <div className="hfs-import-name">{upgrade.name} · Lv {level}/{MAX_UPGRADE_LEVEL}</div>
                        <div className="hfs-import-sub">{upgrade.description}</div>
                        <div className="hfs-upgrade-effect">{upgrade.effect}</div>
                      </div>
                      <button
                        className="hfs-upgrade-buy"
                        onClick={() => buyUpgrade(upgrade.id)}
                        disabled={maxed || cash < cost}
                      >
                        {maxed ? "MAX" : money(cost)}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="hfs-modal-actions">
                <button onClick={() => setShowUpgrades(false)} className="hfs-confirm">Xong</button>
              </div>
            </div>
          </div>
        )}

        {showCatalogUnlock && (
          <div className="hfs-modal-backdrop hfs-unlock-backdrop">
            <div className="hfs-unlock-panel">
              <div className="hfs-unlock-icon hfs-catalog-unlock-icon">🛒</div>
              <div className="hfs-unlock-title">Danh mục sản phẩm mở rộng</div>
              <div className="hfs-unlock-desc">
                Cửa hàng đã được biết đến rộng rãi hơn. Từ ngày {PRODUCT_EXPANSION_DAY}, danh mục sản phẩm được mở rộng để đáp ứng nhu cầu đa dạng của khách hàng.
                <br /><br />
                Để đáp ứng nhu cầu vận hành tăng cao, bạn sẽ cần thuê thêm nhân viên — chi phí hàng ngày sẽ tăng theo.
              </div>
              <button className="hfs-unlock-btn" onClick={() => setShowCatalogUnlock(false)}>
                Bắt đầu bán hàng
              </button>
            </div>
          </div>
        )}

        {showUpgradeUnlock && (
          <div className="hfs-modal-backdrop hfs-unlock-backdrop">
            <div className="hfs-unlock-panel">
              <div className="hfs-unlock-icon">⬆️</div>
              <div className="hfs-unlock-title">Mở khóa Nâng cấp cửa hàng</div>
              <div className="hfs-unlock-desc">
                Từ ngày {UPGRADE_UNLOCK_DAY}, bạn có thể dùng tiền mặt để nâng cấp dao fillet, nhân viên, bảng hiệu VIP và tủ lạnh.
              </div>
              <button
                className="hfs-unlock-btn"
                onClick={() => {
                  setShowUpgradeUnlock(false);
                  setShowUpgrades(true);
                }}
              >
                Xem nâng cấp
              </button>
              <button className="hfs-unlock-skip" onClick={() => setShowUpgradeUnlock(false)}>
                Để sau
              </button>
            </div>
          </div>
        )}

        {showEventUnlock && (
          <div className="hfs-modal-backdrop hfs-unlock-backdrop">
            <div className="hfs-unlock-panel">
              <div className="hfs-unlock-icon hfs-event-unlock-icon">⚡</div>
              <div className="hfs-unlock-title">Vận hành bắt đầu phức tạp</div>
              <div className="hfs-unlock-desc">
                Cửa hàng càng ngày càng làm ăn phát đạt, nhưng các vấn đề cũng sẽ bắt đầu xuất hiện từ ngày {EVENT_UNLOCK_DAY}. Hãy chuẩn bị tiền mặt, tồn kho và nâng cấp phù hợp.
              </div>
              <button className="hfs-unlock-btn" onClick={() => setShowEventUnlock(false)}>
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {showAdUnlock && (
          <div className="hfs-modal-backdrop hfs-unlock-backdrop">
            <div className="hfs-unlock-panel">
              <div className="hfs-unlock-icon">📣</div>
              <div className="hfs-unlock-title">Mở khóa Quảng Cáo</div>
              <div className="hfs-unlock-desc">
                Chạy quảng cáo để tăng lượng khách ngày hôm sau. Mỗi ngày chỉ chạy được một lần.
              </div>
              <div className="hfs-ad-unlock-list">
                <div className="hfs-ad-unlock-row">
                  <span>📄 Phát tờ rơi</span>
                  <span>150k–500k · +3–5 khách</span>
                </div>
                <div className="hfs-ad-unlock-row">
                  <span>📘 Facebook Ads</span>
                  <span>350k–800k · +4–6 khách</span>
                </div>
              </div>
              <div className="hfs-unlock-desc" style={{ marginTop: 8, fontSize: 11 }}>
                Nhấn nút <strong>📣 Ads</strong> trên kệ hàng để chạy quảng cáo.
              </div>
              <button
                className="hfs-unlock-btn"
                onClick={() => { setShowAdUnlock(false); setShowAds(true); }}
              >
                Chạy ngay thôi!
              </button>
              <button className="hfs-unlock-skip" onClick={() => setShowAdUnlock(false)}>
                Để sau
              </button>
            </div>
          </div>
        )}

        {showAds && (
          <div className="hfs-modal-backdrop">
            <div className="hfs-modal">
              <div className="hfs-modal-top">
                <div>
                  <div className="hfs-modal-title">📣 Chạy Quảng Cáo</div>
                  <div className="hfs-modal-sub">Tăng khách ngày mai · chỉ chạy được 1 lần/ngày</div>
                </div>
                <button onClick={() => setShowAds(false)} className="hfs-modal-close">×</button>
              </div>
              <div className="hfs-ad-list">
                {AD_TYPES.map((type) => {
                  const isRun = adRunToday === type.id;
                  const cantAfford = cash < type.costMin;
                  return (
                    <div key={type.id} className={`hfs-ad-row${isRun ? " done" : ""}`}>
                      <div className="hfs-import-icon">{type.icon}</div>
                      <div className="hfs-import-info">
                        <div className="hfs-import-name">{type.name}</div>
                        <div className="hfs-import-sub">{type.desc}</div>
                        <div className="hfs-ad-stats">{type.costMin}k–{type.costMax}k · +{type.extraMin}–{type.extraMax} khách ngày mai</div>
                      </div>
                      <button
                        className="hfs-ad-btn"
                        onClick={() => runAd(type)}
                        disabled={!!adRunToday || cantAfford}
                      >
                        {isRun ? "✓ Đã chạy" : cantAfford ? "Không đủ" : "Chạy"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameOver && !showLeaderboard && (
          <div className="hfs-gameover-backdrop">
            <div className="hfs-gameover-panel">
              <div className="hfs-gameover-icon">
                {gameOverReason === "reputation" ? "📉" : "💸"}
              </div>
              <div className="hfs-gameover-title">
                {gameOverReason === "reputation" ? "Mất uy tín!" : "Cửa hàng phá sản!"}
              </div>
              <div className="hfs-gameover-desc">
                {gameOverReason === "bankrupt" && <>Không đủ tiền chi trả vận hành ngày {day}.<br />Trò chơi kết thúc.</>}
                {gameOverReason === "stolen" && <>Bị trộm sạch tiền mặt sau khi trả chi phí vận hành ngày {day}.<br />Trò chơi kết thúc.</>}
                {gameOverReason === "reputation" && "Rating dưới ⭐2.0 ba ngày liên tiếp — khách hàng đã mất niềm tin vào cửa hàng."}
                {gameOverReason === "" && <>Không đủ tiền chi trả vận hành ngày {day}.<br />Trò chơi kết thúc.</>}
              </div>
              <div className="hfs-gameover-rank">
                {leaderboard.length > 0
                  ? `🏆 Xếp hạng của bạn: #${leaderboard.filter(r => r.score > currentScore).length + 1} / ${leaderboard.length} người chơi`
                  : "⏳ Đang tải xếp hạng..."}
              </div>
              <div className="hfs-gameover-stats">
                <div><span>Ngày đạt được</span><strong>{day}</strong></div>
                <div><span>Doanh thu</span><strong>{money(totalRevenue)}</strong></div>
                <div><span>Lợi nhuận</span><strong>{money(totalProfit)}</strong></div>
                <div><span>Khách phục vụ</span><strong>{servedCount}</strong></div>
                <div><span>Combo tốt nhất</span><strong>x{maxCombo}</strong></div>
                <div className="hfs-gameover-score-cell"><span>Điểm số</span><strong>{currentScore.toLocaleString("vi-VN")}</strong></div>
              </div>
              <div className="hfs-gameover-actions">
                <button
                  className="hfs-gameover-btn-board"
                  onClick={async () => { setShowLeaderboard(true); await loadLeaderboard(); }}
                >
                  🏆 Leaderboard
                </button>
                <button className="hfs-gameover-btn-restart" onClick={resetGame}>
                  🔄 Chơi lại
                </button>
              </div>
            </div>
          </div>
        )}

        <EndDaySummary data={daySummary} onNext={startNextDay} day={day} />

        {showLeaderboard && (
          <div className="hfs-modal-center">
            <div className="hfs-leaderboard-panel">
              <div className="hfs-leaderboard-title">🏆 Leaderboard</div>

              <div className="hfs-score-box">
                <div className="hfs-rank-meta">Điểm hiện tại</div>
                <div className="hfs-score-value">{currentScore.toLocaleString("vi-VN")}</div>
                <div className="hfs-rank-meta">
                  Day {day} · Cash {money(cash)} · DT {money(totalRevenue)} · Lãi {money(totalProfit)} · Max combo x{maxCombo}
                </div>
                <input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={32}
                  className="hfs-name-input"
                  placeholder="Tên người chơi"
                />
                <div className="hfs-leaderboard-actions">
                  <button className="hfs-save-score" onClick={saveScore} disabled={scoreSaved}>
                    {scoreSaved ? "Đã lưu" : "Lưu điểm"}
                  </button>
                  <button className="hfs-close-board" onClick={() => setShowLeaderboard(false)}>Đóng</button>
                </div>
              </div>

              <div className="hfs-rank-list">
                {(() => {
                  const MEDALS = ["🥇", "🥈", "🥉"];
                  const TOP_N = 5;
                  const n = leaderboard.length;
                  const myRank = n === 0 ? 1 : leaderboard.filter(r => r.score > currentScore).length + 1;
                  const myInTop = myRank <= TOP_N;
                  const myIsLast = myRank === n && n > TOP_N;
                  const myIsMid = !myInTop && !myIsLast && myRank <= n;
                  const myBelowAll = myRank > n;

                  const myGhost = {
                    player_name: playerName || "Bạn",
                    score: currentScore,
                    day_reached: day,
                    cash: Math.round(cash),
                    total_revenue: Math.round(totalRevenue),
                    total_profit: Math.round(totalProfit),
                    max_combo: maxCombo,
                    served_count: servedCount,
                  };

                  const renderRow = (row: LeaderboardEntry, rank: number, isMe: boolean) => (
                    <div key={`r${rank}`} className={`hfs-rank-row${isMe ? " hfs-rank-row-me" : ""}`}>
                      <div className="hfs-rank-pos">{rank <= 3 ? MEDALS[rank - 1] : `#${rank}`}</div>
                      <div>
                        <div className="hfs-rank-name">{row.player_name}</div>
                        <div className="hfs-rank-meta">Day {row.day_reached} · Lãi {money(row.total_profit)} · Combo x{row.max_combo}</div>
                      </div>
                      <div className="hfs-rank-score">{row.score.toLocaleString("vi-VN")}</div>
                    </div>
                  );

                  if (n === 0) return <div className="hfs-rank-meta">Chưa có dữ liệu leaderboard.</div>;

                  return (
                    <>
                      {leaderboard.slice(0, Math.min(TOP_N, n)).map((row, i) =>
                        renderRow(row, i + 1, scoreSaved && myRank === i + 1)
                      )}

                      {n > TOP_N && (
                        <>
                          <div className="hfs-rank-ellipsis">· · ·</div>
                          {myIsMid && renderRow(
                            scoreSaved ? leaderboard[myRank - 1] : myGhost,
                            myRank, true
                          )}
                          {(!myIsMid || myRank < n - 1) && (
                            <div className="hfs-rank-ellipsis">· · ·</div>
                          )}
                          {renderRow(leaderboard[n - 1], n, scoreSaved && myIsLast)}
                        </>
                      )}

                      {myBelowAll && (
                        <>
                          <div className="hfs-rank-ellipsis">· · ·</div>
                          {renderRow(myGhost, myRank, true)}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Hud({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "cash" | "revenue" | "profit";
}) {
  return (
    <div className={`hfs-hud-card hfs-hud-${tone}`}>
      <div className="hfs-hud-label">{label}</div>
      <div className="hfs-hud-value">{value}</div>
    </div>
  );
}

function MiniHud({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="hfs-mini-hud">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Bar({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
  return (
    <div>
      <div className="hfs-bar-label">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="hfs-bar-track">
        <div className={`hfs-bar-fill ${color}`} style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  active,
  wanted,
  onClick,
}: {
  product: Product;
  active: boolean;
  wanted: boolean;
  onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(product.id)}
      className={`hfs-product hfs-product-${product.id} ${wanted ? "wanted" : ""} ${active ? "active" : ""}`}
    >
      {active && <div className="hfs-product-check">✓</div>}
      {wanted && !active && <div className="hfs-product-badge">ORDER</div>}

      <div className="hfs-stock">
        <span className="hfs-stock-num">x{qty(product.stock)}</span>
        <span>{product.unit}</span>
      </div>

      <div className="hfs-product-icon-wrap">
        <div className="hfs-product-icon">{product.icon}</div>
      </div>

      <div className="hfs-product-foot">
        <div className="hfs-product-name">{product.name}</div>
        <div className="hfs-product-price">
          {product.id === "wholeSalmon" ? "559k/kg · 3.354k/con" : product.price ? `${money(product.price)}/${product.unit}` : "nguyên liệu"}
        </div>
      </div>
    </button>
  );
}

function StartScreen({ onStart, dimmed }: { onStart: () => void; dimmed?: boolean }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className={`hfs-start-screen ${dimmed ? "dimmed" : ""}`}>
      {!dimmed && (
        <button
          className={`hfs-start-btn ${pressed ? "pressing" : ""}`}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => { setPressed(false); onStart(); }}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          aria-label="Start Game"
        />
      )}
    </div>
  );
}

function TutorialModal({ onConfirm }: { onConfirm: (name: string) => void }) {
  const [name, setName] = useState("");
  const features = [
    { icon: "🛒", name: "Đặt hàng và quản lý hàng hoá", desc: "Chọn sản phẩm phù hợp, nhập hàng và xử lý hàng hoá." },
    { icon: "👥", name: "Phục vụ khách hàng", desc: "Đáp ứng nhu cầu đa dạng và giữ cho khách luôn hài lòng." },
    { icon: "⏱️", name: "Tối ưu doanh thu", desc: "Quản lý thời gian, quyết định thông minh để tăng lợi nhuận." },
    { icon: "⬆️", name: "Mở rộng và nâng cấp", desc: "Nâng cấp cửa hàng, mở rộng không gian và trở thành shop số 1." },
  ];

  return (
    <div className="hfs-tutorial-backdrop">
      <div className="hfs-tutorial-panel">
        <div className="hfs-tutorial-top">
          <div className="hfs-tutorial-store-icon">🏪</div>
          <div>
            <div className="hfs-tutorial-title">CHÀO MỪNG ĐẾN VỚI</div>
            <div className="hfs-tutorial-title2">HOMEFARM SHOP SIMULATOR</div>
          </div>
          <div className="hfs-tutorial-store-icon">🏪</div>
        </div>

        <div className="hfs-tutorial-desc">
          Bạn sẽ vào vai quản lý cửa hàng Homefarm — nhập hàng, phục vụ khách và phát triển cửa hàng ngày một lớn mạnh!
        </div>
        <div className="hfs-tutorial-sound-hint">
          🔊 Game có âm thanh, hãy bật tiếng hoặc đeo tai nghe để có trải nghiệm tốt nhất.
        </div>

        <div className="hfs-tutorial-name-wrap">
          <label className="hfs-tutorial-name-label">🧑‍🌾 Hãy nhập tên của bạn</label>
          <input
            className="hfs-tutorial-name-input"
            type="text"
            placeholder="Tên của bạn..."
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="hfs-tutorial-features">
          {features.map((f) => (
            <div key={f.name} className="hfs-tutorial-feature">
              <div className="hfs-tutorial-feature-icon">{f.icon}</div>
              <div>
                <div className="hfs-tutorial-feature-name">{f.name}</div>
                <div className="hfs-tutorial-feature-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="hfs-tutorial-btn"
          onClick={() => onConfirm(name.trim())}
          disabled={!name.trim()}
        >
          OK, VÀO CA BÁN! 🚀
        </button>
      </div>
    </div>
  );
}

function MascotPanel({ state }: { state: MascotState }) {
  return (
    <div className="hfs-mascot-card">
      <div className="hfs-mascot-bubble">{MASCOT_TALK[state]}</div>
      <Image
        src={MASCOT_ASSETS[state] || MASCOT_ASSETS.idle}
        alt="Homefarm mascot"
        width={96}
        height={132}
        className={`hfs-mascot ${state}`}
        priority
      />
    </div>
  );
}

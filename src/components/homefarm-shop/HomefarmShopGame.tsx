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
import EndDaySummary from "./EndDaySummary";
import "./homefarm-shop.css";

type OrderProduct = Product & { wantQty: number };

const PAGE_SIZE = 8;
const APP_ORDER_SHIPPING_FEE = 20;
const PRODUCT_EXPANSION_DAY = 6;
const UPGRADE_UNLOCK_DAY = 8;
const EVENT_UNLOCK_DAY = 12;
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
  const [scoreSaved, setScoreSaved] = useState(false);
  const [daySummary, setDaySummary] = useState<EndDaySummaryData | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const customer = customers[customerIndex] || null;
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
    if (gamePhase !== "playing" || !customer || showImport || showUpgrades || showCatalogUnlock || showUpgradeUnlock || showEventUnlock || showLeaderboard || activeEvent || gameOver) return;

    const timer = setInterval(() => {
      setMoodScore((m) => Math.max(0, m - (0.8 + day * 0.035)));
      setTimeLeft((t) => {
        if (t <= 1) {
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
  }, [gamePhase, customerIndex, customer, showImport, showUpgrades, showCatalogUnlock, showUpgradeUnlock, showEventUnlock, showLeaderboard, activeEvent, day, skipCustomer]);

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
      setCash((v) => Math.max(0, v - 50));
      setMoodScore((m) => Math.max(0, m - 15));
      setCombo(0);
      setMascotState("wrong");
      setWrongFlash(true);
      window.setTimeout(() => setWrongFlash(false), 260);
      setToast("Chọn sai món! -50k, mood giảm, combo reset 😤");
      return;
    }

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
    const comboBonus = nextCombo >= 3 ? Math.round(bill * (nextMultiplier - 1) * 0.12) : 0;
    const tip = Math.round(baseTip * nextMultiplier);
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
      setMascotState("thinking");
      setToast("Không đủ cá nguyên con để fillet. Cần nhập thêm cá nguyên.");
      return;
    }

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
    const skippedTotal = skippedTodayCount + Math.max(0, customers.length - customerIndex);
    const rating = Math.max(
      1,
      Math.min(5, Number((5 - skippedTotal * 0.35 + servedTodayCount * 0.08).toFixed(1))),
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

  function startNextDay() {
    const remainingCustomers = Math.max(0, customers.length - customerIndex);
    const nextDay = day + 1;
    const opTotal = daySummary?.operatingCost?.total ?? 0;
    const cashAfterCost = cash - opTotal;

    const overnightSpoilage = applyOvernightSpoilage(products, { freezerLevel: upgrades.freezer });
    const unlockedProducts = getUnlockedProducts(nextDay, overnightSpoilage.products);
    const nextEvent = maybeCreateEvent(nextDay);
    const nextProducts = applyEventToProducts(unlockedProducts, nextEvent, { freezerLevel: upgrades.freezer });
    const nextCustomers = generateCustomers(nextProducts, nextDay, {
      signLevel: upgrades.sign,
      staffLevel: upgrades.staff,
      rainyDay: nextEvent?.id === "rainy-day",
    });

    if (cashAfterCost < 0) {
      setCash(cashAfterCost);
      setDaySummary(null);
      setGameOver(true);
      return;
    }

    setCash(Math.max(0, cashAfterCost + (nextEvent?.cashDelta ?? 0)));

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
    if (nextDay === PRODUCT_EXPANSION_DAY) setShowCatalogUnlock(true);
    if (nextDay === UPGRADE_UNLOCK_DAY) setShowUpgradeUnlock(true);
    if (nextDay === EVENT_UNLOCK_DAY) setShowEventUnlock(true);

    const skippedText = remainingCustomers > 0 ? ` · bỏ qua ${remainingCustomers} khách còn lại` : "";
    const spoilageText = overnightSpoilage.affectedCount > 0 ? ` · hao hụt qua đêm ${overnightSpoilage.affectedCount} mặt hàng` : "";
    const catalogText = nextDay === PRODUCT_EXPANSION_DAY ? " · danh mục sản phẩm đã mở rộng" : "";
    const upgradeText = nextDay === UPGRADE_UNLOCK_DAY ? " · đã mở Nâng cấp cửa hàng" : "";
    const eventText = nextDay === EVENT_UNLOCK_DAY ? " · các vấn đề vận hành bắt đầu xuất hiện" : "";
    setToast(`Ngày ${nextDay}: mở khóa ${nextProducts.length} mặt hàng · có ${nextCustomers.length} khách${skippedText}${spoilageText}${catalogText}${upgradeText}${eventText}. Combo tốt nhất: ${maxCombo}.`);
  }

  async function saveScore() {
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
          <TutorialModal onConfirm={(name) => { if (name) setPlayerName(name); setGamePhase("playing"); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="hfs-page">
      <div className={`hfs-phone ${wrongFlash ? "wrong" : ""}`}>
        <div className="hfs-bg" />
        <div className="hfs-version-badge">v{GAME_VERSION}</div>
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
          <button onClick={() => { setMascotState("thinking"); setShowImport(true); }} className="hfs-action hfs-import">🚚 Nhập</button>
          <button onClick={endDay} className="hfs-action hfs-end">🌙 Qua ngày</button>
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
                    <div key={product.id} className="hfs-import-row">
                      <div className="hfs-import-icon">{product.icon}</div>
                      <div className="hfs-import-info">
                        <div className="hfs-import-name">{product.name}</div>
                        <div className="hfs-import-sub">
                          Tồn {qty(product.stock)} {product.unit} · {product.id === "wholeSalmon" ? "1 con = 6kg · Vốn 2.580k/con" : `Vốn ${money(product.cost)}/${product.unit}`}
                        </div>
                      </div>
                      <div className="hfs-stepper">
                        <button onClick={() => setQty(product.id, q - 1)} className="hfs-step-minus">−</button>
                        <div className="hfs-step-value">{q}</div>
                        <button onClick={() => setQty(product.id, q + 1)} className="hfs-step-plus">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hfs-modal-actions">
                <button onClick={() => setShowImport(false)} className="hfs-cancel">Huỷ</button>
                <button onClick={confirmImport} className="hfs-confirm">Nhập {money(importCost)}</button>
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

        {gameOver && (
          <div className="hfs-gameover-backdrop">
            <div className="hfs-gameover-panel">
              <div className="hfs-gameover-icon">💸</div>
              <div className="hfs-gameover-title">Cửa hàng phá sản!</div>
              <div className="hfs-gameover-desc">Không đủ tiền chi trả vận hành ngày {day}. Trò chơi kết thúc.</div>
              <div className="hfs-gameover-score">{currentScore.toLocaleString("vi-VN")} điểm</div>
              <button
                className="hfs-summary-next"
                onClick={async () => { setShowLeaderboard(true); await loadLeaderboard(); }}
              >
                🏆 Xem Leaderboard
              </button>
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
        </div>

        <div className="hfs-tutorial-desc">
          Bạn sẽ vào vai quản lý cửa hàng Homefarm — nhập hàng, phục vụ khách và phát triển cửa hàng ngày một lớn mạnh!
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

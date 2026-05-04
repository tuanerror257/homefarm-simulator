"use client";

import { useEffect, useMemo, useState } from "react";
import type { MascotState, Product, ShopEvent } from "@/types/homefarm-shop";
import { MASCOT_ASSETS, MASCOT_TALK, START_PRODUCTS } from "@/lib/homefarm-shop/data";
import {
  applyEventToProducts,
  calcTipRate,
  calculateScore,
  generateCustomers,
  getStockShortageMessage,
  getUnlockedProducts,
  maybeCreateEvent,
  money,
  qty,
} from "@/lib/homefarm-shop/gameUtils";
import { fetchLeaderboard, saveLeaderboardEntry, type LeaderboardEntry } from "@/lib/homefarm-shop/leaderboard";
import "./homefarm-shop.css";

type OrderProduct = Product & { wantQty: number };

const PAGE_SIZE = 8;

export function HomefarmShopGame() {
  const [products, setProducts] = useState(START_PRODUCTS);
  const [day, setDay] = useState(1);
  const [cash, setCash] = useState(1000);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [servedCount, setServedCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [customers, setCustomers] = useState(() => generateCustomers(START_PRODUCTS, 1));
  const [customerIndex, setCustomerIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(customers[0].patience);
  const [toast, setToast] = useState("Tap từng món khách cần mua trên kệ hàng");
  const [showImport, setShowImport] = useState(false);
  const [importQty, setImportQty] = useState<Record<string, number>>({});
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

  const customer = customers[customerIndex] || null;
  const orderProducts: OrderProduct[] = customer
    ? customer.order.map((order) => ({ ...products.find((p) => p.id === order.id)!, wantQty: order.qty }))
    : [];

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

  const currentScore = calculateScore({
    day,
    cash,
    totalRevenue,
    totalProfit,
    servedCount,
    maxCombo,
  });

  useEffect(() => {
    if (!customer) {
      setMascotState("happy");
      return;
    }
    setTimeLeft(customer.patience);
    setMoodScore(Math.max(10, 100 + eventMoodPenalty));
    setSelected([]);
    setMascotState(customer.repeat ? "trust" : "idle");
  }, [customerIndex, day, customer, eventMoodPenalty]);

  useEffect(() => {
    if (!customer || showImport || showLeaderboard || activeEvent) return;

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
  }, [customerIndex, customer, showImport, showLeaderboard, activeEvent, day]);

  async function loadLeaderboard() {
    try {
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch {
      setToast("Không tải được leaderboard. Kiểm tra Supabase/env nhé.");
    }
  }

  function skipCustomer(msg: string) {
    setSelected([]);
    if (customerIndex >= customers.length - 1) {
      setCustomerIndex(customers.length);
      setToast("Hết khách hôm nay. Bấm End Day để sang ngày mới.");
    } else {
      setCustomerIndex((v) => v + 1);
      setToast(msg);
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
    setToast("Đã chọn đúng món. Mood +4");
  }

  function deliver() {
    if (!customer) {
      setToast("Hết khách rồi. Bấm End Day để sang ngày mới.");
      return;
    }

    if (!isComplete) {
      setMascotState("idea");
      setToast("Chưa đủ món trong order, chọn tiếp đã bro");
      return;
    }

    const notEnough = orderProducts.find((p) => p.stock < p.wantQty);
    if (notEnough) {
      setCombo(0);
      setMoodScore((m) => Math.max(0, m - 10));
      setMascotState("thinking");
      setToast(`${getStockShortageMessage(notEnough)} Combo reset.`);
      return;
    }

    const speedRatio = timeLeft / customer.patience;
    const tip = bill * calcTipRate(customer, timeLeft, moodScore, combo);
    const thisOrderProfit = orderProfit + tip;
    const nextCombo = speedRatio > 0.5 && moodScore >= 45 ? combo + 1 : 0;

    setProducts((prev) =>
      prev.map((p) => {
        const o = customer.order.find((x) => x.id === p.id);
        return o ? { ...p, stock: Number((p.stock - o.qty).toFixed(1)) } : p;
      }),
    );

    setCash((v) => v + bill + tip);
    setRevenue((v) => v + bill);
    setProfit((v) => v + thisOrderProfit);
    setTotalRevenue((v) => v + bill);
    setTotalProfit((v) => v + thisOrderProfit);
    setServedCount((v) => v + 1);
    setCombo(nextCombo);
    setMaxCombo((v) => Math.max(v, nextCombo));
    setMascotState(nextCombo >= 3 ? "combo" : "happy");

    let msg = `Bill +${money(bill)} / Lãi ${money(thisOrderProfit)}`;
    if (tip > 0) msg += ` / Tip +${money(tip)}`;
    if (nextCombo > 1) msg += ` / Combo x${nextCombo} 🔥`;
    if (customer.repeat) msg += " / Khách quen quay lại 🔁";
    skipCustomer(msg);
  }

  function fillet() {
    const whole = products.find((p) => p.id === "wholeSalmon");
    if (!whole || whole.stock < 1) {
      setMascotState("thinking");
      setToast("Không đủ cá nguyên con để fillet. Cần nhập thêm cá nguyên.");
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === "wholeSalmon"
          ? { ...p, stock: Number((p.stock - 1).toFixed(1)) }
          : p.id === "salmon"
            ? { ...p, stock: Number((p.stock + 4.8).toFixed(1)) }
            : p.id === "headBone"
              ? { ...p, stock: Number((p.stock + 1.2).toFixed(1)) }
              : p,
      ),
    );

    setMascotState("trust");
    setToast("Fillet 1 con cá 6kg: -1 con cá nguyên, +4.8kg fillet, +1.2kg đầu xương.");
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
    if (customer && customerIndex < customers.length) {
      setMascotState("idea");
      setToast("Vẫn còn khách trong ngày. Phục vụ hết rồi hãy End Day nhé.");
      return;
    }

    const nextDay = day + 1;
    const unlocked = getUnlockedProducts(nextDay, products);
    const event = maybeCreateEvent(nextDay);
    const eventProducts = applyEventToProducts(unlocked, event);
    const newCustomers = generateCustomers(eventProducts, nextDay);

    const cashDelta = event?.cashDelta ?? 0;
    if (cashDelta !== 0) {
      setCash((v) => Math.max(0, v + cashDelta));
    }

    const moodDelta = event?.moodDelta ?? 0;
    setEventMoodPenalty(moodDelta);

    setDay(nextDay);
    setRevenue(0);
    setProfit(0);
    setProducts(eventProducts);
    setCustomers(newCustomers);
    setCustomerIndex(0);
    setTimeLeft(newCustomers[0].patience);
    setMoodScore(100);
    setSelected([]);
    setProductPage(0);
    setMascotState("idle");
    setActiveEvent(event);
    setToast(`Ngày ${nextDay}: mở khóa ${eventProducts.length} mặt hàng · có ${newCustomers.length} khách.`);
  }

  async function finishRun() {
    setShowLeaderboard(true);
    await loadLeaderboard();
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
      setToast("Đã lưu điểm lên leaderboard.");
    } catch {
      setToast("Lưu điểm lỗi. Kiểm tra Supabase table/env nhé.");
    }
  }

  return (
    <div className="hfs-page">
      <div className={`hfs-phone ${wrongFlash ? "wrong" : ""}`}>
        <div className="hfs-bg" />

        <header className="hfs-header">
          <div className="hfs-brand-art">
            <img src="/homefarm-shop/header-brand.png" alt="Homefarm Shop Simulator" className="hfs-brand-img" />
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
                      <div className="hfs-combo">🔥 x{combo}</div>
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
                      Bill {money(bill)} · Lãi {money(orderProfit)} · Tip ~{money(estimatedTip)}
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
                <div className="hfs-inventory-pill">Inventory</div>
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

          <div className="hfs-toast">💬 {toast}</div>
        </main>

        <footer className="hfs-footer">
          <button onClick={fillet} className="hfs-action hfs-fillet">🔪 Fillet</button>
          <button onClick={deliver} className={`hfs-action hfs-deliver ${isComplete ? "ready" : ""}`}>✅ Giao</button>
          <button onClick={() => { setMascotState("thinking"); setShowImport(true); }} className="hfs-action hfs-import">🚚 Nhập</button>
          <button onClick={customer ? finishRun : endDay} className="hfs-action hfs-end">
            {customer ? "🏁 Kết thúc" : "🌙 End"}
          </button>
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
                {leaderboard.length === 0 && <div className="hfs-rank-meta">Chưa có dữ liệu leaderboard.</div>}
                {leaderboard.map((row, index) => (
                  <div className="hfs-rank-row" key={row.id || `${row.player_name}-${index}`}>
                    <div>#{index + 1}</div>
                    <div>
                      <div>{row.player_name}</div>
                      <div className="hfs-rank-meta">Day {row.day_reached} · Lãi {money(row.total_profit)} · Combo x{row.max_combo}</div>
                    </div>
                    <div>{row.score.toLocaleString("vi-VN")}</div>
                  </div>
                ))}
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

function MascotPanel({ state }: { state: MascotState }) {
  return (
    <div className="hfs-mascot-card">
      <div className="hfs-mascot-bubble">{MASCOT_TALK[state]}</div>
      <img src={MASCOT_ASSETS[state] || MASCOT_ASSETS.idle} alt="Homefarm mascot" className={`hfs-mascot ${state}`} />
    </div>
  );
}

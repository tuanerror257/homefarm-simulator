import React from "react";
import type { EndDaySummaryData } from "@/types/homefarm-shop";
import { money } from "@/lib/homefarm-shop/gameUtils";
import { sfx } from "@/lib/homefarm-shop/sfx";

type EndDaySummaryProps = {
  data: EndDaySummaryData | null;
  onNext: () => void;
  day: number;
};

const COST_HIKE_DAYS = [6, 12, 18];

export default function EndDaySummary({ data, onNext, day }: EndDaySummaryProps) {
  if (!data) return null;

  const { operatingCost: op, cashAfterCost } = data;
  const costHike = COST_HIKE_DAYS.includes(day);

  return (
    <div className="hfs-summary-backdrop">
      <div className="hfs-summary-panel">
        <div className="hfs-summary-title">📊 Ngày {day} kết thúc</div>

        <div className="hfs-summary-grid">
          <div><span>Doanh thu</span><strong>{money(data.revenue)}</strong></div>
          <div><span>Lãi</span><strong>{money(data.profit)}</strong></div>
          <div><span>Phục vụ</span><strong>{data.served}/{data.total}</strong></div>
          <div><span>Bỏ qua</span><strong>{data.skipped}</strong></div>
          <div><span>Combo max</span><strong>x{data.combo}</strong></div>
          <div><span>Rating</span><strong>{data.rating}/5</strong></div>
        </div>

        <div className="hfs-cost-section">
          <div className="hfs-cost-label">Chi phí vận hành</div>
          <div className="hfs-cost-line"><span>Thuê nhà</span><span>{money(op.rent)}</span></div>
          <div className={`hfs-cost-line${costHike ? " hfs-cost-hike" : ""}`}>
            <span>Nhân viên{costHike ? " ↑" : ""}</span>
            <span>{money(op.staff)}</span>
          </div>
          <div className={`hfs-cost-line${costHike ? " hfs-cost-hike" : ""}`}>
            <span>Điện nước{costHike ? " ↑" : ""}</span>
            <span>{money(op.utilities)}</span>
          </div>
          <div className="hfs-cost-line"><span>Khác</span><span>~{money(op.other)}</span></div>
          <div className="hfs-cost-total-line"><span>Tổng chi phí</span><span>-{money(op.total)}</span></div>
        </div>

        <div className={`hfs-cash-after ${cashAfterCost < 0 ? "danger" : ""}`}>
          <span>Tiền còn lại</span>
          <strong>{money(cashAfterCost)}</strong>
        </div>

        {data.topSellers.length > 0 && (
          <div className="hfs-stat-section">
            <div className="hfs-stat-label">🔥 Bán chạy hôm nay</div>
            {data.topSellers.map((s) => (
              <div key={s.id} className="hfs-stat-row">
                <span>{s.icon} {s.name}</span>
                <span>{s.soldQty % 1 === 0 ? s.soldQty : s.soldQty.toFixed(1)} {s.unit} · {money(s.revenue)}</span>
              </div>
            ))}
          </div>
        )}

        {data.excessStock.length > 0 && (
          <div className="hfs-stat-section warning">
            <div className="hfs-stat-label">📦 Tồn kho nhiều, chưa bán</div>
            {data.excessStock.map((s) => (
              <div key={s.name} className="hfs-stat-row">
                <span>{s.icon} {s.name}</span>
                <span>{s.stock % 1 === 0 ? s.stock : s.stock.toFixed(1)} {s.unit} tồn</span>
              </div>
            ))}
          </div>
        )}

        {cashAfterCost < 0 && (
          <div className="hfs-summary-warning">⚠️ Không đủ tiền — cửa hàng sẽ phá sản!</div>
        )}

        <button onClick={() => { sfx.nextDay(); onNext(); }} className="hfs-summary-next">
          Sang ngày {day + 1}
        </button>
      </div>
    </div>
  );
}

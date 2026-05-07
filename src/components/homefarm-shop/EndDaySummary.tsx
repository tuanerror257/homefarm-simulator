import React from "react";
import type { EndDaySummaryData } from "@/types/homefarm-shop";
import { money } from "@/lib/homefarm-shop/gameUtils";
import { sfx } from "@/lib/homefarm-shop/sfx";

type EndDaySummaryProps = {
  data: EndDaySummaryData | null;
  onNext: () => void;
  day: number;
};

export default function EndDaySummary({ data, onNext, day }: EndDaySummaryProps) {
  if (!data) return null;

  const { operatingCost: op, cashAfterCost } = data;

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
          <div className="hfs-cost-line"><span>Nhân viên</span><span>{money(op.staff)}</span></div>
          <div className="hfs-cost-line"><span>Điện nước</span><span>{money(op.utilities)}</span></div>
          <div className="hfs-cost-line"><span>Khác</span><span>~{money(op.other)}</span></div>
          <div className="hfs-cost-total-line"><span>Tổng chi phí</span><span>-{money(op.total)}</span></div>
        </div>

        <div className={`hfs-cash-after ${cashAfterCost < 0 ? "danger" : ""}`}>
          <span>Tiền còn lại</span>
          <strong>{money(cashAfterCost)}</strong>
        </div>

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

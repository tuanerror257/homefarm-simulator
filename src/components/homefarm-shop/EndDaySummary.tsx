import React from "react";
import type { EndDaySummaryData } from "@/types/homefarm-shop";
import { money } from "@/lib/homefarm-shop/gameUtils";

type EndDaySummaryProps = {
  data: EndDaySummaryData | null;
  onNext: () => void;
  day: number;
};

export default function EndDaySummary({ data, onNext, day }: EndDaySummaryProps) {
  if (!data) return null;

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
          <div className="hfs-summary-cost-row">
            <span>Chi phí VH</span>
            <strong className="hfs-summary-cost">-{money(data.operatingCost)}</strong>
          </div>
          <div className="hfs-summary-cost-row">
            <span>Tiền còn lại</span>
            <strong className={data.cashAfterCost < 0 ? "hfs-summary-cost" : ""}>{money(data.cashAfterCost)}</strong>
          </div>
        </div>

        {data.cashAfterCost < 0 && (
          <div className="hfs-summary-warning">⚠️ Không đủ tiền — cửa hàng sẽ phá sản!</div>
        )}

        <button onClick={onNext} className="hfs-summary-next">
          Sang ngày {day + 1}
        </button>
      </div>
    </div>
  );
}

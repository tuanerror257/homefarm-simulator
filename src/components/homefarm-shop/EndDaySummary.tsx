import React from "react";

export default function EndDaySummary({ data, onNext, day }: any) {
  if (!data) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999
    }}>
      <div style={{
        background: "#fff",
        padding: 24,
        borderRadius: 12,
        width: 320
      }}>
        <h2>📊 Ngày {day} kết thúc</h2>
        <p>💰 Doanh thu: {data.revenue}k</p>
        <p>📈 Lãi: {data.profit}k</p>
        <p>👥 Phục vụ: {data.served}/{data.total}</p>
        <p>🔥 Combo max: x{data.combo}</p>
        <p>⭐ Rating: {data.rating}/5</p>

        <button onClick={onNext} style={{marginTop:12}}>
          👉 Sang ngày {day + 1}
        </button>
      </div>
    </div>
  );
}

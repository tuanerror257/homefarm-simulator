"use client";

import dynamic from "next/dynamic";

const HomefarmShopGame = dynamic(
  () =>
    import("@/components/homefarm-shop/HomefarmShopGame").then(
      (mod) => mod.HomefarmShopGame,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ead9b8",
          color: "#2d2118",
          fontWeight: 900,
          fontFamily:
            'ui-rounded, "SF Pro Rounded", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Loading Homefarm Shop Simulator...
      </div>
    ),
  },
);

export default function Page() {
  return <HomefarmShopGame />;
}

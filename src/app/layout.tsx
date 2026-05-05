import "./globals.css";

export const metadata = {
  title: "Homefarm Simulator",
  description: "Homefarm Shop Simulator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

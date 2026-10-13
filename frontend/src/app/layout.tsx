import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WorldRing · Spatial Intelligence Platform",
  description: "Decoding the physical world for humans and autonomous physical AI. Commodity 360° optical capture to centimeter-accurate continuous 3D environments.",
  keywords: ["Spatial AI", "LiDAR", "Gaussian Splatting", "Worldring", "Physical AI", "Autonomous Navigation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased selection:bg-cyan-500/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}

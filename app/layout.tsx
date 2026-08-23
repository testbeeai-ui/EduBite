import type { Metadata } from "next";
import localFont from "next/font/local";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AppClockProvider } from "@/lib/clock/app-clock";
import { RdmRewardsProvider } from "@/lib/rdm/rdm-rewards-provider";
import { GameProvider } from "@/lib/store/game-provider";
import "./globals.css";

const TABLER_ICONS_HREF =
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css";

/** Self-hosted — avoids Vercel build failures when fonts.gstatic.com is unreachable. */
const baloo = localFont({
  src: [
    { path: "./fonts/baloo-2-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/baloo-2-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/baloo-2-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "./fonts/baloo-2-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-baloo",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = localFont({
  src: [
    {
      path: "./fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/jetbrains-mono-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/jetbrains-mono-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Edubite",
  description: "Daily learning habits, streaks, and integrity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href={TABLER_ICONS_HREF} />
      </head>
      <body
        className={`${baloo.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
        suppressHydrationWarning
      >
        <div id="edubite-root">
          <AuthProvider>
            <AppClockProvider>
              <RdmRewardsProvider>
                <GameProvider>{children}</GameProvider>
              </RdmRewardsProvider>
            </AppClockProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}

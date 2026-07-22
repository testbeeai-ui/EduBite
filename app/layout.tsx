import type { Metadata } from "next";
import { Baloo_2, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth/auth-provider";
import { AppClockProvider } from "@/lib/clock/app-clock";
import { GameProvider } from "@/lib/store/game-provider";
import "./globals.css";

const TABLER_ICONS_HREF =
  "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-jetbrains",
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
        <link rel="stylesheet" href={TABLER_ICONS_HREF} />
      </head>
      <body
        className={`${baloo.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <AppClockProvider>
            <GameProvider>{children}</GameProvider>
          </AppClockProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Brain Gym · Edubite",
  description: "Edubite Brain Gym embed for the mobile app",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * Chrome-free layout for the React Native WebView host.
 * Root AuthProvider / GameProvider still wrap via app/layout.tsx.
 */
export default function BrainGymEmbedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body, #edubite-root {
          min-height: 100dvh;
          height: 100%;
          overscroll-behavior: none;
        }
        body {
          padding:
            env(safe-area-inset-top, 0px)
            env(safe-area-inset-right, 0px)
            env(safe-area-inset-bottom, 0px)
            env(safe-area-inset-left, 0px);
        }
        /* Hide site-level chrome if any slips in */
        .edubite-brain-gym-embed [data-edubite-site-nav],
        .edubite-brain-gym-embed [data-edubite-app-header] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}

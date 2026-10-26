import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ManualSyncModal } from "@/components/ui/ManualSyncModal";
import { DisputeModal } from "@/components/ui/DisputeModal";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TWM 3.1 — Track. Win. Maintain. | Class Developer Activity Platform",
  description: "A class-focused multi-platform developer activity and friendly competition platform. Connect your GitHub, LeetCode, and HackerRank profiles to track verified progress.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "TWM 3.1 — Track. Win. Maintain.",
    description: "Institutional-grade developer activity tracking and friendly competition for engineering cohorts.",
    images: [
      {
        url: "/twm_dashboard_view.png",
        width: 1280,
        height: 800,
        alt: "TWM Cockpit Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TWM 3.1 — Track. Win. Maintain.",
    description: "Institutional-grade developer activity tracking and friendly competition for engineering cohorts.",
    images: ["/twm_dashboard_view.png"],
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                localStorage.removeItem('twm-theme');
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="bg-canvas text-ink min-h-screen antialiased selection:bg-accent selection:text-canvas">
        <MotionProvider>
          <AppProvider>
            {children}
            <ToastContainer />
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#0E121A",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#F1F5F9",
                  fontFamily: "var(--font-sans)",
                  borderRadius: "14px",
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.7)",
                },
              }}
            />
            <CommandPalette />
            <ManualSyncModal />
            <DisputeModal />
          </AppProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

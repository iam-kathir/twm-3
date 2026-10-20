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
  title: "TWM 3.0 — Track. Win. Maintain. | Class Developer Activity Platform",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-canvas text-ink min-h-screen antialiased selection:bg-accent selection:text-canvas">
        <MotionProvider>
          <AppProvider>
            {children}
            <ToastContainer />
            <CommandPalette />
            <ManualSyncModal />
            <DisputeModal />
          </AppProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

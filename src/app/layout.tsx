import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ManualSyncModal } from "@/components/ui/ManualSyncModal";
import { DisputeModal } from "@/components/ui/DisputeModal";
import { Toaster } from "sonner";

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

// NEXT_PUBLIC_APP_URL is the documented public origin (see .env.example §6).
// Safe fallback keeps metadataBase valid for local/dev and never leaks secrets.
function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  try {
    return raw ? new URL(raw).origin : "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`dark ${sora.variable} ${jetbrainsMono.variable}`}>
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
                  background: "var(--surface)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-sans)",
                  borderRadius: "var(--radius-panel)",
                  boxShadow: "var(--shadow-overlay)",
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

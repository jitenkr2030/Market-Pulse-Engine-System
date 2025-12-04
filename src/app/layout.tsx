import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Market Pulse Engine - Real-time Market Analysis",
  description: "Advanced market analysis platform with real-time pulse indicators, sentiment tracking, and AI-powered insights for comprehensive market monitoring.",
  keywords: ["Market Pulse", "Trading", "Analysis", "Real-time", "AI", "Sentiment", "Volatility", "Liquidity"],
  authors: [{ name: "Market Pulse Engine Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Market Pulse Engine",
    description: "Real-time market analysis with AI-powered insights",
    url: "https://market-pulse-engine.com",
    siteName: "Market Pulse Engine",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Market Pulse Engine",
    description: "Real-time market analysis with AI-powered insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <WebSocketProvider>
            {children}
            <Toaster />
          </WebSocketProvider>
        </Providers>
      </body>
    </html>
  );
}

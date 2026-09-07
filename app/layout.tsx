import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWithOptionalHeader } from "@/components/LayoutWithOptionalHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#061018",
};

export const metadata: Metadata = {
  title: "Go Away Day",
  description: "Malta — 3–7 oktober 2026",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Go Away Day",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className="safe-area-padding">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased overscroll-none`}
      >
        <div className="mx-auto w-full max-w-[100vw] px-4 pb-[env(safe-area-inset-bottom)] pt-[max(1.5rem,env(safe-area-inset-top))]">
          <LayoutWithOptionalHeader>{children}</LayoutWithOptionalHeader>
        </div>
      </body>
    </html>
  );
}

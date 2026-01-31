import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";

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
};

export const metadata: Metadata = {
  title: "Go Away Day",
  description: "Waar gaan Erik & Benno in oktober 2026 naartoe?",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
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
          <header className="mb-5 text-center">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              Go Away Day
            </h1>
            <div className="relative mx-auto mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-foreground/5">
              <Image
                src="/images/go-away-day-hero.jpeg"
                alt="Erik & Benno"
                fill
                className="object-cover object-[center_25%]"
                priority
                sizes="100vw"
              />
            </div>
          </header>
          <main className="min-h-[40vh]">{children}</main>
        </div>
      </body>
    </html>
  );
}

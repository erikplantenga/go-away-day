"use client";

import { HeroCarousel } from "@/components/HeroCarousel";

export function LayoutWithOptionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-[#f4efe4] sm:text-2xl">Go Away Day</h1>
        <p className="mt-1 text-sm text-[#c9a227]">Malta · 3–7 oktober 2026</p>
        <HeroCarousel />
      </header>
      <main className="min-h-[40vh]">{children}</main>
    </>
  );
}

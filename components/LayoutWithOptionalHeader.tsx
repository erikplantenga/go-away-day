"use client";

import Image from "next/image";

export function LayoutWithOptionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Go Away Day</h1>
        <p className="mt-1 text-sm text-foreground/60">Malta · 3–7 oktober 2026</p>
        <div className="relative mx-auto mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-foreground/5">
          <Image
            src="/images/go-away-day-hero.jpeg"
            alt="Erik & Benno"
            fill
            className="object-cover object-[center_15%]"
            priority
            sizes="100vw"
          />
        </div>
      </header>
      <main className="min-h-[40vh]">{children}</main>
    </>
  );
}

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

export function LayoutWithOptionalHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDemoSpin = pathname === "/demo-spin";

  if (isDemoSpin) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        {children}
      </div>
    );
  }

  return (
    <>
      <header className="mb-5 text-center">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">
          Go Away Day
        </h1>
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

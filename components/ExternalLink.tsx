"use client";

import { useState, type ReactNode } from "react";

function isHttp(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

function isUber(href: string) {
  return href.startsWith("uber:") || href.includes("m.uber.com") || href.includes("uber.com");
}

function hostLabel(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return href;
  }
}

export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const needsWarn = isHttp(href);

  if (!needsWarn) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }

  const uber = isUber(href);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-8">
          <div className="w-full max-w-md rounded-2xl bg-[#0b1f3a] p-5 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
              {uber ? "Externe app" : "Externe website"}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/90">
              {uber
                ? "Deze link opent de Uber-app. Staat die er niet op, dan kom je op de Uber-site."
                : "Deze link gaat naar een externe website. Je verlaat Go Away Day."}
            </p>
            <p className="mt-2 truncate text-sm text-white/55">{hostLabel(href)}</p>
            <div className="mt-5 space-y-2">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#0b1f3a]"
              >
                {uber ? "Uber openen" : "Doorgaan"}
              </a>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

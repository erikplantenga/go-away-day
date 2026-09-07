"use client";

import { useEffect, useState } from "react";
import { HOTEL } from "@/lib/maltaTrip";

const PACK_KEY = "goaway_packlist";

const PACK_ITEMS = [
  "Paspoort of ID",
  "Tickets / boardingpass",
  "UK-stekker (type G)",
  "Zwembroek + rashguard",
  "Zonnebrand",
  "Comfortabele schoenen",
  "Lichte jas",
  "Powerbank",
  "Contant voor ferry / taxi",
  "Medicijnen",
] as const;

const LINKS = [
  { label: "112 Nood", href: "tel:112", primary: true },
  { label: `Hotel receptie ${HOTEL.phone}`, href: HOTEL.phoneHref },
  { label: `Reserveringen ${HOTEL.reservationsPhone}`, href: HOTEL.reservationsPhoneHref },
  { label: "Mail hotel", href: `mailto:${HOTEL.email}` },
  { label: "Sliema–Valletta ferry", href: "https://www.vallettaferryservices.com" },
  { label: "Bussen Tallinja", href: "https://www.publictransport.com.mt" },
  { label: "eCabs taxi", href: "https://www.ecabs.com.mt" },
  { label: "Schiphol", href: "https://www.schiphol.nl" },
  { label: "KM Malta Airlines", href: "https://www.kmmaltaairlines.com" },
  { label: "Malta Airport", href: "https://www.maltairport.com" },
];

export function Handig() {
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PACK_KEY);
      if (raw) setChecked(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (item: string) => {
    setChecked((cur) => {
      const next = cur.includes(item) ? cur.filter((x) => x !== item) : [...cur, item];
      localStorage.setItem(PACK_KEY, JSON.stringify(next));
      return next;
    });
  };

  const packed = checked.filter((item) => PACK_ITEMS.includes(item as (typeof PACK_ITEMS)[number])).length;

  return (
    <div className="space-y-4 pb-3">
      <div>
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-[#c9a227]">
          Paklijst · {packed}/{PACK_ITEMS.length}
        </p>
        <ul className="mt-2 space-y-1">
          {PACK_ITEMS.map((item) => {
            const on = checked.includes(item);
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left active:bg-white/10"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs ${
                      on ? "border-[#c9a227] bg-[#c9a227] text-[#0b1f3a]" : "border-white/30 text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`text-sm ${on ? "text-white/45 line-through" : "text-white"}`}>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="px-1 text-xs font-semibold uppercase tracking-wider text-[#c9a227]">Bellen & openen</p>
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            className={`flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold ${
              link.primary ? "bg-red-600 text-white" : "bg-white/10 text-white"
            }`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

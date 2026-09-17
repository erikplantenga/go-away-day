"use client";

import { ExternalLink } from "@/components/ExternalLink";
import {
  formatCheckedAt,
  type DailyBriefing,
  type UpdateKind,
} from "@/lib/maltaUpdates";

const KIND: Record<UpdateKind, string> = {
  planning: "Planning",
  weer: "Weer",
  malta: "Malta",
};

export function Updates({ briefing }: { briefing: DailyBriefing }) {
  return (
    <div className="space-y-3 pb-3">
      <p className="px-1 text-sm text-white/65">
        Dagelijks rond 10:00 een ronde langs planning, weer en Malta-nieuws. Alle info is welkom.
      </p>
      <ul className="space-y-2">
        {briefing.items.map((item) => (
          <li key={item.id} className="rounded-xl bg-white/10 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a227]">
              {KIND[item.kind]}
              {item.source ? ` · ${item.source}` : ""}
            </p>
            <p className="mt-1 text-[15px] font-semibold leading-snug">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/75">{item.body}</p>
            {item.href && (
              <ExternalLink
                href={item.href}
                className="mt-2 justify-start rounded-lg bg-white/10 px-3 text-left text-sm font-semibold text-white"
              >
                Open bron
              </ExternalLink>
            )}
          </li>
        ))}
      </ul>
      <p className="px-1 text-xs text-white/45">
        Laatst gekeken {formatCheckedAt(briefing.checkedAt)}
        {briefing.live ? " · live" : " · opgeslagen briefing"}
      </p>
    </div>
  );
}

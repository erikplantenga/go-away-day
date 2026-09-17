"use client";

import { ExternalLink } from "@/components/ExternalLink";
import { formatCheckedAt, type DailyBriefing } from "@/lib/maltaUpdates";

export function Updates({ briefing }: { briefing: DailyBriefing }) {
  return (
    <div className="space-y-3 pb-3">
      <p className="px-1 text-sm text-white/65">
        Alleen nieuwe activiteiten terwijl we er zijn (3–7 okt). Hoe klein ook: padel, borduren, salsa, festa. Geen
        weer, geen vluchten, niets wat al in de planning staat.
      </p>
      <ul className="space-y-2">
        {briefing.items.map((item) => (
          <li key={item.id} className="rounded-xl bg-white/10 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a227]">
              Activiteit
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
        {briefing.live ? " · live" : " · opgeslagen lijst"} · Insta/Facebook-posts kunnen we niet open lezen; dit komt
        van Malta-eventkalenders.
      </p>
    </div>
  );
}

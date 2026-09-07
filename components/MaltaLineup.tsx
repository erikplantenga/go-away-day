"use client";

import { useState } from "react";
import { MALTA_XI, type PitchPlayer } from "@/lib/maltaLineup";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function PlayerToken({
  player,
  active,
  onPick,
}: {
  player: PitchPlayer;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${player.x}%`, top: `${100 - player.y}%` }}
      aria-label={`${player.number} ${player.name}, ${player.role}`}
    >
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow-md ${
          active
            ? "border-[#c9a227] bg-[#fff4cc] text-[#0b1f3a]"
            : "border-white bg-[#f3d2b0] text-[#3a2414]"
        }`}
      >
        {initials(player.name)}
        <span className="absolute -bottom-1.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-[#c8102e] px-0.5 text-[9px] font-extrabold text-white shadow">
          {player.number}
        </span>
        {player.captain && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c9a227] text-[8px] font-black text-[#0b1f3a]">
            C
          </span>
        )}
      </span>
      <span
        className={`mt-2 max-w-[4.6rem] truncate text-[9px] font-semibold leading-tight ${
          active ? "text-[#c9a227]" : "text-white"
        }`}
      >
        {player.short}
      </span>
    </button>
  );
}

export function MaltaLineup() {
  const [picked, setPicked] = useState<PitchPlayer>(
    MALTA_XI.players.find((p) => p.captain) ?? MALTA_XI.players[0],
  );

  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-[#14532d]">
      <div className="flex items-center justify-between px-3 pt-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#c9a227]">{MALTA_XI.title}</p>
        <p className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
          {MALTA_XI.formation}
        </p>
      </div>

      <div className="relative mx-3 mt-3 aspect-[3/4] overflow-hidden rounded-xl border-2 border-white/25 bg-[#1a7a3a]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, #166534 0 12.5%, #15803d 12.5% 25%)",
          }}
        />
        <div className="absolute inset-[6%] rounded-sm border border-white/70" />
        <div className="absolute inset-x-[28%] top-[6%] h-[16%] border border-white/70" />
        <div className="absolute inset-x-[28%] bottom-[6%] h-[16%] border border-white/70" />
        <div className="absolute left-1/2 top-1/2 h-[22%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70" />
        <div className="absolute inset-x-0 top-1/2 border-t border-white/70" />
        <div className="absolute bottom-[5%] left-1/2 h-1.5 w-8 -translate-x-1/2 rounded-sm bg-white/80" />
        <div className="absolute left-1/2 top-[5%] h-1.5 w-8 -translate-x-1/2 rounded-sm bg-white/80" />

        <div className="absolute inset-x-[5%] top-[8%] bottom-[12%]">
          {MALTA_XI.players.map((player) => (
            <PlayerToken
              key={player.id}
              player={player}
              active={picked.id === player.id}
              onPick={() => setPicked(player)}
            />
          ))}
        </div>
      </div>

      <div className="px-3 py-3">
        <p className="text-sm font-semibold text-white">
          {picked.number} {picked.name}
          {picked.captain ? " · aanvoerder" : ""}
        </p>
        <p className="text-xs text-white/70">{picked.role}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-white/55">{MALTA_XI.note}</p>
      </div>
    </div>
  );
}

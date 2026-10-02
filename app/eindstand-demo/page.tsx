"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MpQuizStand } from "@/components/MpQuizStand";

function isLocalDemoHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

export default function EindstandDemoPage() {
  const router = useRouter();
  const [local, setLocal] = useState(false);

  useEffect(() => {
    if (!isLocalDemoHost()) {
      router.replace("/");
      return;
    }
    setLocal(true);
  }, [router]);

  if (!local) return null;

  return (
    <MpQuizStand
      preview
      finale
      benno={1555}
      erik={1600}
      daysLeft={0}
      played={{ erik: true, benno: true }}
      correct={{ erik: 5, benno: 4 }}
      quizMs={{ erik: 39_000, benno: 52_000 }}
      misses={{
        benno: [
          {
            date: "2026-10-03",
            question: "Hoeveel verschil zit er in de leeftijd van Benno en Erik?",
            answer: "9",
            picked: "10",
          },
        ],
        erik: [],
      }}
      onClose={() => router.push("/")}
    />
  );
}

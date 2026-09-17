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

const TRANSFER = "Hoe laat is de transfer naar het vliegveld?";
const MALTA = "Tegen wie speelt Malta?";

export default function TussenstandDemoPage() {
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
      benno={28}
      erik={26}
      daysLeft={16}
      played={{ erik: true, benno: true }}
      correct={{ erik: 4, benno: 3 }}
      quizMs={{ erik: 58_400, benno: 102_000 }}
      misses={{
        benno: [
          {
            date: "2026-09-17",
            question: TRANSFER,
            answer: "05:15",
            picked: "06:00",
          },
          {
            date: "2026-09-17",
            question: MALTA,
            answer: "Andorra",
            picked: "San Marino",
          },
        ],
        erik: [
          {
            date: "2026-09-17",
            question: MALTA,
            answer: "Andorra",
            picked: "Gibraltar",
          },
        ],
      }}
      onClose={() => router.push("/")}
    />
  );
}

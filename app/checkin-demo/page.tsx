"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckInOpenFeest } from "@/components/CheckInOpenFeest";

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

export default function CheckInDemoPage() {
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

  return <CheckInOpenFeest preview onClose={() => router.push("/")} />;
}

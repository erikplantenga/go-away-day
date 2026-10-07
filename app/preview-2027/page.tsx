"use client";

import dynamic from "next/dynamic";

const GlobeScene = dynamic(() => import("@/components/GlobeScene2027"), {
  ssr: false,
  loading: () => (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        color: "#00ff41",
        fontFamily: "monospace",
        fontSize: "1rem",
        textShadow: "0 0 10px #00ff41",
      }}>
        {"> LOADING..."}
      </div>
    </div>
  ),
});

export default function Preview2027() {
  return <GlobeScene />;
}

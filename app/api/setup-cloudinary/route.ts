import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    return NextResponse.json({ error: "No CLOUDINARY_URL" }, { status: 500 });
  }

  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!match) {
    return NextResponse.json({ error: "Invalid CLOUDINARY_URL" }, { status: 500 });
  }

  const [, apiKey, apiSecret, cloudName] = match;

  // Create unsigned upload preset
  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import("crypto");
  
  const params = {
    name: "go_away_day_unsigned",
    unsigned: "true",
    folder: "go-away-day",
  };
  
  const paramsString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&") + `&timestamp=${timestamp}`;
    
  const signature = crypto
    .createHash("sha1")
    .update(paramsString + apiSecret)
    .digest("hex");

  const formData = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => formData.append(k, v));
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`,
    {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const data = await res.json();
  
  return NextResponse.json({ 
    success: res.ok,
    preset: "go_away_day_unsigned",
    cloudName,
    data 
  });
}

import type { IdeasUser } from "./ideas2027";

const FACE_KEY = "ideas2027_faceid";

export type FaceIdVault = {
  user: IdeasUser;
  password: string;
  credId: string; // base64url
};

function b64urlFromBuf(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bufFromB64url(s: string): ArrayBuffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export function faceIdSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.PublicKeyCredential && typeof navigator.credentials?.create === "function";
}

/** Async check for Face ID / Touch ID / Windows Hello */
export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (!faceIdSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {}
  return true; // API aanwezig → knop tonen, enable faalt anders met duidelijke error
}

export function loadFaceIdVault(): FaceIdVault | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FACE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as FaceIdVault;
    if ((v.user === "erik" || v.user === "benno") && v.password && v.credId) return v;
  } catch {}
  return null;
}

export function clearFaceIdVault() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FACE_KEY);
}

/** Register platform authenticator (Face ID / Touch ID) and store login vault */
export async function enableFaceId(user: IdeasUser, password: string): Promise<void> {
  if (!faceIdSupported()) throw new Error("Face ID niet beschikbaar op dit apparaat");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const userId = new TextEncoder().encode(`ideas2027:${user}`);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: {
        name: "Go Away Day Ideeën",
        id: window.location.hostname,
      },
      user: {
        id: userId,
        name: user,
        displayName: user === "erik" ? "Erik" : "Benno",
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },
        { alg: -257, type: "public-key" },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Face ID geannuleerd");

  const vault: FaceIdVault = {
    user,
    password,
    credId: b64urlFromBuf(cred.rawId),
  };
  localStorage.setItem(FACE_KEY, JSON.stringify(vault));
}

/** Unlock with Face ID / Touch ID and return stored session */
export async function loginWithFaceId(): Promise<{ user: IdeasUser; password: string }> {
  const vault = loadFaceIdVault();
  if (!vault) throw new Error("Face ID nog niet ingesteld");
  if (!faceIdSupported()) throw new Error("Face ID niet beschikbaar");

  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge,
      rpId: window.location.hostname,
      allowCredentials: [
        {
          id: bufFromB64url(vault.credId),
          type: "public-key",
          transports: ["internal"],
        },
      ],
      userVerification: "required",
      timeout: 60_000,
    },
  });

  if (!assertion) throw new Error("Face ID geannuleerd");
  return { user: vault.user, password: vault.password };
}

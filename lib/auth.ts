import type { UserId } from "./firestore";

const TOKEN_ERIK = process.env.NEXT_PUBLIC_TOKEN_ERIK ?? "";
const TOKEN_BENNO = process.env.NEXT_PUBLIC_TOKEN_BENNO ?? "";

/** Geen tokens ingesteld = lokaal testen: elke token mag. */
const noTokensSet = !TOKEN_ERIK && !TOKEN_BENNO;

export function validateToken(
  user: string,
  token: string | null
): UserId | null {
  if (noTokensSet) {
    // Lokaal testen: geen token nodig, elke gebruiker mag door
    if (user === "erik" || user === "benno") return user as UserId;
    return null;
  }
  if (!token) return null;
  if (user === "erik" && token === TOKEN_ERIK) return "erik";
  if (user === "benno" && token === TOKEN_BENNO) return "benno";
  return null;
}

export function isValidUserSegment(user: string): user is UserId {
  return user === "erik" || user === "benno";
}

"use client";

import { useSearchParams } from "next/navigation";
import { validateToken, isValidUserSegment } from "@/lib/auth";
import { PhaseBanner } from "@/components/PhaseBanner";
import { PhaseContent } from "@/components/PhaseContent";
import { ZoWerktHet } from "@/components/ZoWerktHet";
import { FeestDag } from "@/components/FeestDag";
type Props = { user: string };

export function UserPageClient({ user }: Props) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!isValidUserSegment(user)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
        <p>Ongeldige pagina. Gebruik /erik of /benno met je token.</p>
      </div>
    );
  }

  const currentUser = validateToken(user, token);
  if (!currentUser) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        <p>Ongeldige link. Gebruik de juiste URL met je token.</p>
      </div>
    );
  }

  return (
    <>
      <FeestDag />
      <ZoWerktHet showDemoHint />
      <div className="mb-6 rounded-lg border border-foreground/10 bg-background p-4">
        <PhaseBanner />
      </div>
      <PhaseContent currentUser={currentUser} />
    </>
  );
}

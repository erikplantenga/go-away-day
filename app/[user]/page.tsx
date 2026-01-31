import { Suspense } from "react";
import { UserPageClient } from "@/components/UserPageClient";

type Props = { params: Promise<{ user: string }> };

export async function generateStaticParams() {
  return [{ user: "erik" }, { user: "benno" }];
}

export default async function UserPage({ params }: Props) {
  const { user } = await params;
  return (
    <Suspense fallback={<p className="text-center text-foreground/70">Laden...</p>}>
      <UserPageClient user={user} />
    </Suspense>
  );
}

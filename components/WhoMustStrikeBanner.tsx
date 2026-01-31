"use client";

type Props = {
  erikCount: number;
  bennoCount: number;
  required: number;
};

export function WhoMustStrikeBanner({ erikCount, bennoCount, required }: Props) {
  if (required <= 0) return null;
  const erikDone = erikCount >= required;
  const bennoDone = bennoCount >= required;
  if (erikDone && bennoDone) return null;
  return (
    <div className="space-y-1 text-center text-sm text-foreground/80">
      <p>Erik: {erikCount}/{required} weggestreept{!erikDone && " – moet nog wegstrepen"}.</p>
      <p>Benno: {bennoCount}/{required} weggestreept{!bennoDone && " – moet nog wegstrepen"}.</p>
    </div>
  );
}

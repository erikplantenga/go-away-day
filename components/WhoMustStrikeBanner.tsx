"use client";

type Props = {
  erikDone: boolean;
  bennoDone: boolean;
};

export function WhoMustStrikeBanner({ erikDone, bennoDone }: Props) {
  if (erikDone && bennoDone) return null;
  return (
    <div className="space-y-1 text-center text-sm text-foreground/80">
      {!erikDone && <p>Erik moet nog wegstrepen.</p>}
      {!bennoDone && <p>Benno moet nog wegstrepen.</p>}
    </div>
  );
}

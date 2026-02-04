/**
 * Gedeelde AudioContext voor iOS Safari: moet binnen een user gesture
 * worden ontgrendeld (create + resume), anders blijft geluid geblokkeerd.
 * Roep unlockAudio() aan aan het begin van elke knop-actie die geluid kan triggeren.
 */

let sharedContext: AudioContext | null = null;

export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  if (sharedContext?.state === "running") return;
  if (sharedContext?.state === "suspended") {
    void sharedContext.resume();
    return;
  }
  try {
    sharedContext = new AudioContext();
    if (sharedContext.state === "suspended") {
      void sharedContext.resume();
    }
  } catch {
    sharedContext = null;
  }
}

export function getAudioContext(): AudioContext | null {
  return sharedContext;
}

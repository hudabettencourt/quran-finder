const AUDIO_BASE =
  "https://cdn.alquran.cloud/media/audio/ayah/ar.alafasy/128";

let currentAudio: HTMLAudioElement | null = null;
let currentAyahNumber: number | null = null;
const listeners = new Set<(ayahNumber: number | null) => void>();

function notify() {
  for (const listener of listeners) {
    listener(currentAyahNumber);
  }
}

export function getAyahAudioUrl(globalAyahNumber: number): string {
  return `${AUDIO_BASE}/${globalAyahNumber}`;
}

export function getPlayingAyahNumber(): number | null {
  return currentAyahNumber;
}

export function subscribePlayingAyah(
  listener: (ayahNumber: number | null) => void,
): () => void {
  listeners.add(listener);
  listener(currentAyahNumber);
  return () => listeners.delete(listener);
}

export function stopAyahAudio() {
  if (!currentAudio) {
    return;
  }

  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = null;
  currentAyahNumber = null;
  notify();
}

export async function playAyahAudio(globalAyahNumber: number): Promise<void> {
  if (currentAyahNumber === globalAyahNumber && currentAudio) {
    if (currentAudio.paused) {
      await currentAudio.play();
    } else {
      currentAudio.pause();
      currentAyahNumber = null;
      notify();
    }
    return;
  }

  stopAyahAudio();

  const audio = new Audio(getAyahAudioUrl(globalAyahNumber));
  currentAudio = audio;
  currentAyahNumber = globalAyahNumber;
  notify();

  audio.addEventListener("ended", () => {
    if (currentAudio === audio) {
      currentAudio = null;
      currentAyahNumber = null;
      notify();
    }
  });

  audio.addEventListener("error", () => {
    if (currentAudio === audio) {
      currentAudio = null;
      currentAyahNumber = null;
      notify();
    }
  });

  await audio.play();
}

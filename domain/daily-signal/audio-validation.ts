const allowedAudioTypes = new Set(["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg"]);
const maxAudioBytes = 10 * 1024 * 1024;

export function validateAudio(audio: File): { error: string; status: number } | null {
  const mime = audio.type.split(";")[0];
  if (!allowedAudioTypes.has(mime)) return { error: "Use WebM, OGG, MP4, or MP3 audio.", status: 415 };
  if (!audio.size || audio.size > maxAudioBytes) return { error: "Audio must be between 1 byte and 10 MB.", status: 413 };
  return null;
}

import { useCallback } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi } from "../services/AiService";

// Helper to convert MIDI number to pitch name, e.g. 60 → C4
function midiToPitchName(n: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(n / 12) - 1;
  return `${names[n % 12]}${octave}`;
}

export const useGenerateNotes = () => {
  const { tracks } = useSong();

  const generateNotes = useCallback(async () => {
    // Use track 1 as in the example (A3, E4, etc. are typically not in track 0/metronome/drums)
    if (tracks.length < 2) return;

    const currentTrack = tracks[1];
    if (!currentTrack) return;

    // Select MIDI notes on this track
    const notes: any[] = currentTrack.events.filter(
      (event) => event.type === "channel" && event.subtype === "note"
    );

    // --- Format header
    const tokens: string[] = [];
    tokens.push("TEMPO 120");
    tokens.push("TIMEBASE 384");
    tokens.push(""); // blank line after header

    // Sort notes by tick (start time)
    const sortedNotes = [...notes].sort((a, b) => a.tick - b.tick);

    let lastTick = 0;

    for (const note of sortedNotes) {
      const startTick = note.tick;
      const endTick = note.tick + note.duration;
      const velocity = note.velocity ?? 100;
      const noteName = midiToPitchName(note.pitch ?? note.noteNumber ?? 60);

      // TIME_SHIFT from last note end to start of this note
      const delta = startTick - lastTick;
      if (delta > 0) tokens.push(`TIME_SHIFT ${delta}`);

      // NOTE_ON line
      tokens.push(`NOTE_ON ${noteName} VELOCITY ${velocity}`);

      // TIME_SHIFT for note duration
      const dur = endTick - startTick;
      tokens.push(`TIME_SHIFT ${dur}`);

      // NOTE_OFF line
      tokens.push(`NOTE_OFF ${noteName}`);

      lastTick = endTick;
    }

    // Join for output, match spacing in @complete.txt
    const finalStr = tokens.join('\n');
    console.log(finalStr);



    const resultStr = await completeMidi(finalStr);
    console.log(resultStr);
  }, [tracks]);

  return {
    generateNotes,
  };
}
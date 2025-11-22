import { useCallback } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi, getMidiResponse } from "../services/AiService";

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

    setTimeout(async () => {
      checkResponseReady(resultStr.id, currentTrack);
    }, 1000);

  }, [tracks]);

  return {
    generateNotes,
  };
}

async function checkResponseReady(id: string, currentTrack: any) {
  const result = await getMidiResponse(id);
  console.log(result);
  if (result.status === "completed") {
    console.log(result.tokens);

    // INSERT_YOUR_CODE
    // This will convert tokens (string) to an array of events.
    // Each line of tokens is a single event in the format described.
    const tokenLines = result.tokens.split('\n').map((line: string) => line.trim()).filter(Boolean);
    const events = [];
    for (const line of tokenLines) {
      // Example event formats:
      // - TEMPO 120
      // - TIMEBASE 480
      // - NOTE_ON C4 VELOCITY 100
      // - NOTE_START 960
      // - NOTE_END 1200
      // - TIME_SHIFT 480
      // - NOTE_OFF C4
      const parts = line.split(' ');
      switch (parts[0]) {
        case 'TEMPO':
          events.push({ type: 'TEMPO', bpm: Number(parts[1]) });
          break;
        case 'TIMEBASE':
          events.push({ type: 'TIMEBASE', timebase: Number(parts[1]) });
          break;
        case 'NOTE_ON':
          events.push({ 
            type: 'NOTE_ON', 
            note: parts[1], 
            velocity: Number(parts[3]) 
          });
          break;
        case 'NOTE_START':
          events.push({ type: 'NOTE_START', start: Number(parts[1]) });
          break;
        case 'NOTE_END':
          events.push({ type: 'NOTE_END', end: Number(parts[1]) });
          break;
        case 'TIME_SHIFT':
          events.push({ type: 'TIME_SHIFT', shift: Number(parts[1]) });
          break;
        case 'NOTE_OFF':
          events.push({ type: 'NOTE_OFF', note: parts[1] });
          break;
        default:
          // Unknown token, ignore or log warning
          break;
      }
    }
    console.log("Events:", events);

    // INSERT_YOUR_CODE
    if (Array.isArray(currentTrack?.events)) {
      currentTrack.events.push(...events);
    }


    return result.tokens;
  }
  setTimeout(() => {
    checkResponseReady(id, currentTrack);
  }, 1000);
}
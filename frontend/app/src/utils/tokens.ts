export const tokensToNotes = (tokens: string, notesOffset: number) => {
  const tokenLines = tokens.split('\n').map((line: string) => line.trim()).filter(Boolean);
  const events: any[] = [];
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

  let notes: any[] = []

  // Process events to create notes
  let currentTick = 0;
  const activeNotes: Record<string, { start: number, velocity: number }> = {};

  for (const event of events) {
    switch (event.type) {
      case 'TIME_SHIFT':
        currentTick += event.shift;
        break;
      case 'NOTE_ON':
        activeNotes[event.note] = { start: currentTick, velocity: event.velocity };
        break;
      case 'NOTE_OFF':
        const active = activeNotes[event.note];
        if (active) {
          const duration = currentTick - active.start;
          const noteNumber = pitchNameToMidi(event.note);

          notes.push({
            type: "channel",
            subtype: "note",
            noteNumber: noteNumber,
            tick: notesOffset + active.start,
            velocity: active.velocity,
            duration: duration
          })

          delete activeNotes[event.note];
        }
        break;
    }
  }

  return notes
}

export function notesToTokens (notes: any) {
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
    const noteName = midiToPitchName(note.noteNumber ?? 60);

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

  return finalStr
}


function pitchNameToMidi(pitch: string): number {
  const noteToNum: Record<string, number> = {
    "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
    "E": 4, "F": 5, "F#": 6, "Gb": 6, "G": 7, "G#": 8, "Ab": 8,
    "A": 9, "A#": 10, "Bb": 10, "B": 11
  };
  const match = pitch.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) return 60;
  const note = match[1];
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + (noteToNum[note] || 0);
}

// Helper to convert MIDI number to pitch name, e.g. 60 → C4
function midiToPitchName(n: number): string {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(n / 12) - 1;
  return `${names[n % 12]}${octave}`;
}

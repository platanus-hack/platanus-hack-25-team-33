import fs from "fs";
import path from "path";
import MidiPkg from "@tonejs/midi";
const { Midi } = MidiPkg;

// Convert MIDI note number → name (C4, D#3…)
function midiToPitchName(n) {
  const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(n / 12) - 1;
  return `${names[n % 12]}${octave}`;
}

async function midiToTokens(midiPath, timebase = 384) {
  const data = fs.readFileSync(midiPath);
  const midi = new Midi(data);

  const tempo = Math.round(
    midi.header.tempos?.[0]?.bpm || midi.header.bpm || 120
  );

  const tokens = [];
  tokens.push(`TEMPO ${tempo}`);
  tokens.push(`TIMEBASE ${timebase}`);

  // Convert tempo → seconds per tick
  const secondsPerTick = (60 / tempo) / timebase;

  // Collect all notes across all tracks into one list
  const allNotes = [];
  midi.tracks.forEach((track) => {
    track.notes.forEach((note) => {
      allNotes.push({
        name: midiToPitchName(note.midi),
        start: note.time,
        end: note.time + note.duration,
        velocity: Math.round(note.velocity * 127),
      });
    });
  });

  // Sort events by start time
  allNotes.sort((a, b) => a.start - b.start);
  let lastTick = 0;

  for (const note of allNotes) {
    const startTick = Math.round(note.start / secondsPerTick);
    const endTick = Math.round(note.end / secondsPerTick);

    // Add time shift from previous event
    const delta = startTick - lastTick;
    if (delta > 0) tokens.push(`TIME_SHIFT ${delta}`);

    // NOTE ON
    tokens.push(`NOTE_ON ${note.name} VELOCITY ${note.velocity}`);

    // Duration → TIME_SHIFT
    const dur = endTick - startTick;
    tokens.push(`TIME_SHIFT ${dur}`);

    // NOTE OFF
    tokens.push(`NOTE_OFF ${note.name}`);

    lastTick = endTick;
  }

  return tokens.join("\n");
}

// -------- CLI Execution --------
async function main() {
  const midiPath = process.argv[2];
  if (!midiPath) {
    console.error("Usage: node midiToTokens.js <path-to-midi>");
    process.exit(1);
  }

  const resolved = path.resolve(midiPath);

  if (!fs.existsSync(resolved)) {
    console.error("File not found:", resolved);
    process.exit(1);
  }

  const tokens = await midiToTokens(resolved);
  console.log(tokens);
}

main();
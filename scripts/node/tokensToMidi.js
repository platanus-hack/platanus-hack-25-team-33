import pkg from "@tonejs/midi";
const { Midi } = pkg;

import fs from "fs";

function noteToMidi(n) {
  const map = { C:0, "C#":1, D:2, "D#":3, E:4, F:5, "F#":6, G:7, "G#":8, A:9, "A#":10, B:11 };
  const name = n.replace("♯", "#").toUpperCase();
  const letter = name.slice(0, -1);
  const octave = parseInt(name.slice(-1));
  return map[letter] + (octave + 1) * 12;
}

function parseTokens(lines) {
  let events = [];
  let time = 0;
  let bpm = 120;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const parts = line.split(" ");

    if (parts[0] === "TEMPO") {
      bpm = parseInt(parts[1]);
      continue;
    }

    if (parts[0] === "TIME_SHIFT") {
      time += parseInt(parts[1]);
      continue;
    }

    if (parts[0] === "NOTE_ON") {
      events.push({
        type: "on",
        note: noteToMidi(parts[1]),
        velocity: parseInt(parts[3]),
        time
      });
      time = 0;
      continue;
    }

    if (parts[0] === "NOTE_OFF") {
      events.push({
        type: "off",
        note: noteToMidi(parts[1]),
        time
      });
      time = 0;
      continue;
    }
  }

  return { bpm, events };
}

const inputFile = process.argv[2];
const outputFile = process.argv[3] || "output.mid";

if (!inputFile) {
  console.error("Usage: node tokensToMidi.js <tokens.txt> [output.mid]");
  process.exit(1);
}

const text = fs.readFileSync(inputFile, "utf8").trim();
const lines = text.split("\n");

const { bpm, events } = parseTokens(lines);

const midi = new Midi();
midi.header.tempos.push({ bpm, ticks: 0 });

const track = midi.addTrack();

let currentTick = 0;
let activeNotes = {}; // noteNumber → startTick & velocity

for (const e of events) {
  currentTick += e.time;

  if (e.type === "on") {
    activeNotes[e.note] = {
      start: currentTick,
      velocity: e.velocity / 127
    };
  }

  if (e.type === "off") {
    const note = activeNotes[e.note];

    if (note) {
      track.addNote({
        midi: e.note,
        ticks: note.start,
        durationTicks: currentTick - note.start,
        velocity: note.velocity
      });

      delete activeNotes[e.note];
    }
  }
}

fs.writeFileSync(outputFile, Buffer.from(midi.toArray()));
console.log("Created MIDI:", outputFile);
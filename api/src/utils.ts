import fs from 'fs';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { Midi } from '@tonejs/midi';

// Type for each note in the MIDI file
interface Note {
  name: string;
  start: number;
  end: number;
  velocity: number;
}

// Token event interface
interface Event {
  type: 'on' | 'off';
  note: number;
  velocity?: number;
  time: number;
  startTimeSec?: number;
  endTimeSec?: number;
}

@Injectable()
export class MidiTokenProcessor {
  // Convert MIDI note number → name (C4, D#3…)
  private midiToPitchName(n: number): string {
    const names = [
      'C',
      'C#',
      'D',
      'D#',
      'E',
      'F',
      'F#',
      'G',
      'G#',
      'A',
      'A#',
      'B',
    ];
    const octave = Math.floor(n / 12) - 1;
    return `${names[n % 12]}${octave}`;
  }

  // Convert note name (e.g., "C4") to MIDI number
  private noteToMidi(n: string): number {
    const map: Record<string, number> = {
      C: 0,
      'C#': 1,
      D: 2,
      'D#': 3,
      E: 4,
      F: 5,
      'F#': 6,
      G: 7,
      'G#': 8,
      A: 9,
      'A#': 10,
      B: 11,
    };
    const name = n.replace('♯', '#').toUpperCase();
    const letter = name.slice(0, -1);
    const octave = parseInt(name.slice(-1));
    return map[letter] + (octave + 1) * 12;
  }

  // Parse token lines into events and BPM
  private parseTokens(lines: string[]): {
    bpm: number;
    timebase: number;
    events: Event[];
  } {
    const events: Event[] = [];
    let time = 0;
    let bpm = 120;
    let timebase = 480;

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      const parts = line.split(' ');

      if (parts[0] === 'TEMPO') {
        bpm = parseInt(parts[1]);
        continue;
      }

      if (parts[0] === 'TIMEBASE') {
        timebase = parseInt(parts[1]);
        continue;
      }

      if (parts[0] === 'TIME_SHIFT') {
        time += parseInt(parts[1]);
        continue;
      }

      if (parts[0] === 'NOTE_ON') {
        events.push({
          type: 'on',
          note: this.noteToMidi(parts[1]),
          velocity: parseInt(parts[3]),
          time,
        });
        continue;
      }

      if (parts[0] === 'NOTE_START') {
        const lastEvent = events[events.length - 1];
        if (lastEvent && lastEvent.type === 'on') {
          lastEvent.startTimeSec = parseFloat(parts[1]);
        }
        continue;
      }

      if (parts[0] === 'NOTE_END') {
        const lastEvent = events[events.length - 1];
        if (lastEvent && lastEvent.type === 'on') {
          lastEvent.endTimeSec = parseFloat(parts[1]);
        }
        continue;
      }

      if (parts[0] === 'NOTE_OFF') {
        events.push({
          type: 'off',
          note: this.noteToMidi(parts[1]),
          time,
        });
      }
    }

    return { bpm, timebase, events };
  }

  public midiToTokens(midiPath: string, timebase: number): string {
    const data = fs.readFileSync(midiPath);
    const midi = new Midi(data);

    const tempo = Math.round(midi.header.tempos?.[0]?.bpm || 120);

    const tokens: string[] = [];
    tokens.push(`TEMPO ${tempo}`);
    tokens.push(`TIMEBASE ${timebase}`);

    const secondsPerTick = 60 / tempo / timebase;

    const allNotes: Note[] = [];
    midi.tracks.forEach((track) => {
      track.notes.forEach((note) => {
        allNotes.push({
          name: this.midiToPitchName(note.midi),
          start: note.time,
          end: note.time + note.duration,
          velocity: Math.round(note.velocity * 127),
        });
      });
    });

    allNotes.sort((a, b) => a.start - b.start);
    let lastTick = 0;

    for (const note of allNotes) {
      const startTick = Math.round(note.start / secondsPerTick);
      const endTick = Math.round(note.end / secondsPerTick);

      const delta = startTick - lastTick;
      if (delta > 0) tokens.push(`TIME_SHIFT ${delta}`);

      tokens.push(`NOTE_ON ${note.name} VELOCITY ${note.velocity}`);
      tokens.push(`NOTE_START ${note.start}`);
      tokens.push(`NOTE_END ${note.end}`);
      const dur = endTick - startTick;
      tokens.push(`TIME_SHIFT ${dur}`);

      tokens.push(`NOTE_OFF ${note.name}`);

      lastTick = endTick;
    }

    return tokens.join('\n');
  }

  // Convert MIDI to tokens and process token-based MIDI generation
  public processMidiFile(
    inputTokens: string,
    outputFile: string = 'output.mid',
  ): void {
    // Parse the tokens to get bpm and events
    const {
      bpm,
      timebase: tokenTimebase,
      events,
    } = this.parseTokens(inputTokens.split('\n'));

    // Initialize a new, empty MIDI file
    const midi = new Midi();

    // Add the tempo information to the header
    midi.header.tempos.push({ bpm, ticks: 0 });

    // Create a new track
    const track = midi.addTrack();

    let currentTick = 0;
    const activeNotes: Record<number, { start: number; velocity: number }> = {}; // noteNumber → startTick & velocity

    // Process the events to generate MIDI notes
    events.forEach((event) => {
      currentTick = event.time;

      // If we have precise timing from NOTE_START/NOTE_END, use it
      if (event.startTimeSec !== undefined && event.endTimeSec !== undefined) {
        const startTicks = Math.round(
          (event.startTimeSec * bpm * tokenTimebase) / 60,
        );
        const endTicks = Math.round(
          (event.endTimeSec * bpm * tokenTimebase) / 60,
        );

        track.addNote({
          midi: event.note,
          ticks: startTicks,
          durationTicks: endTicks - startTicks,
          velocity: event.velocity! / 127,
        });
        return;
      }

      if (event.type === 'on') {
        activeNotes[event.note] = {
          start: currentTick,
          velocity: event.velocity! / 127, // Ensure velocity is divided by 127
        };
      }

      if (event.type === 'off') {
        const note = activeNotes[event.note];

        if (note) {
          track.addNote({
            midi: event.note,
            ticks: note.start,
            durationTicks: currentTick - note.start,
            velocity: note.velocity,
          });

          delete activeNotes[event.note];
        }
      }
    });

    // Write the MIDI file to disk
    fs.writeFileSync(outputFile, Buffer.from(midi.toArray()));
    console.log('Created MIDI:', outputFile);
  }
}

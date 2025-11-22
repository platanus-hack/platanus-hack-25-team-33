import { useCallback } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi, getMidiResponse } from "../services/AiService";
import { isNoteEvent, NoteEvent } from "@signal-app/core";

import { usePianoRoll } from "../hooks/usePianoRoll"
import { notesToTokens, tokensToNotes } from "../utils/tokens";

export const useGenerateNotes = () => {
  const { tracks } = useSong();
  const { setCandidateNotes } = usePianoRoll();

  const generateNotes = useCallback(async () => {
    // Use track 1 as in the example (A3, E4, etc. are typically not in track 0/metronome/drums)
    if (tracks.length < 2) return;

    const currentTrack = tracks[1];
    if (!currentTrack) return;

    // Select MIDI notes on this track
    const notes = currentTrack.events.filter(isNoteEvent);

    const tokens = notesToTokens(notes)

    const resultStr = await completeMidi(tokens);
    console.log(resultStr);

    setTimeout(async () => {
      checkResponseReady(resultStr.id, currentTrack, setCandidateNotes);
    }, 1000);

  }, [tracks]);

  return {
    generateNotes,
  };
}

async function checkResponseReady(id: string, currentTrack: any, setCandidateNotes: (notes: any[]) => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "completed") {
    console.log(result.tokens);

    let lastNoteEnd = 0;

    if (currentTrack && Array.isArray(currentTrack.events)) {
      for (const event of currentTrack.events) {
        if (isNoteEvent(event)) {
          const end = event.tick + event.duration;
          if (end > lastNoteEnd) {
            lastNoteEnd = end;
          }
        }
      }
    }

    const candidateNotes = tokensToNotes(result.tokens, lastNoteEnd)
    setCandidateNotes(candidateNotes);

    return result.tokens;
  }
  setTimeout(() => {
    checkResponseReady(id, currentTrack, setCandidateNotes);
  }, 1000);
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
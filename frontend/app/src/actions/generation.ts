import { useCallback, useRef } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi, getMidiResponse } from "../services/AiService";
import { isNoteEvent, NoteEvent } from "@signal-app/core";

import { usePianoRoll } from "../hooks/usePianoRoll"
import { notesToTokens, tokensToNotes } from "../utils/tokens";

export const useGenerateNotes = () => {
  const { tracks } = useSong();
  const { setCandidateNotes, selectedTrack } = usePianoRoll();
  const selectedTrackRef = useRef(selectedTrack);
  selectedTrackRef.current = selectedTrack;

  const generateNotes = useCallback(async () => {
    // Use track 1 as in the example (A3, E4, etc. are typically not in track 0/metronome/drums)
    if (tracks.length < 2) return;

    if (!selectedTrack) return;

    // Select MIDI notes on this track
    const notes = selectedTrack.events.filter(isNoteEvent);

    const tokens = notesToTokens(notes)

    const resultStr = await completeMidi(tokens);
    console.log(resultStr);

    setTimeout(async () => {
      checkResponseReady(resultStr.id, () => selectedTrackRef.current, setCandidateNotes);
    }, 1000);

  }, [tracks, selectedTrack]);

  return {
    generateNotes,
  };
}

async function checkResponseReady(id: string, getSelectedTrack: () => any, setCandidateNotes: (notes: any[]) => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "completed") {
    console.log(result.tokens);

    let lastNoteEnd = 0;
    const selectedTrack = getSelectedTrack();

    if (selectedTrack && Array.isArray(selectedTrack.events)) {
      for (const event of selectedTrack.events) {
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
    checkResponseReady(id, getSelectedTrack, setCandidateNotes);
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
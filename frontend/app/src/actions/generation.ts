import { useCallback, useRef, useState } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi, generateAccompanimentMidi, getMidiResponse } from "../services/AiService";
import { isNoteEvent, NoteEvent } from "@signal-app/core";

import { usePianoRoll } from "../hooks/usePianoRoll"
import { notesToTokens, tokensToNotes } from "../utils/tokens";

export const useGenerateNotes = () => {
  const { tracks } = useSong();
  const { setCandidateNotes, selectedTrack } = usePianoRoll();
  const selectedTrackRef = useRef(selectedTrack);
  selectedTrackRef.current = selectedTrack;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateNotes = useCallback(async (instrument: string) => {
    setIsLoading(true);
    setIsSuccess(false);

    // Use track 1 as in the example (A3, E4, etc. are typically not in track 0/metronome/drums)
    if (tracks.length < 2) return;

    if (!selectedTrack) return;

    // Select MIDI notes on this track
    const notes = selectedTrack.events.filter(isNoteEvent);

    const tokens = notesToTokens(notes)

    const result = await completeMidi(tokens, instrument);
    console.log(result);

    setTimeout(async () => {
      checkMidiResponseReady(result.id, selectedTrack, (notes: any[]) => {
        setIsLoading(false);
        setIsSuccess(true);
        setCandidateNotes(notes);
      });
    }, 1000);

  }, [tracks, selectedTrack]);

  return {
    generateNotes,
    isLoading,
    isSuccess,
  };
}

async function checkMidiResponseReady(id: string, selectedTrack: any, setCandidateNotes: (notes: any[]) => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "completed") {
    console.log(result.tokens);

    let lastNoteEnd = 0;

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
    checkMidiResponseReady(id, selectedTrack, setCandidateNotes);
  }, 1000);
}

export const useGenerateAccompaniment = ({ onSuccess }: { onSuccess: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateAccompaniment = useCallback(async (prompt: string, tokens: string, instrument: string) => {
    setIsLoading(true);
    setIsSuccess(false);

    const result = await generateAccompanimentMidi(prompt, tokens, instrument);
    console.log(result);

    setTimeout(async () => {
      checkAccompanimentResponseReady(result.id, () => {
        setIsLoading(false);
        setIsSuccess(true);
        onSuccess()
      })
    }, 1000);
  }, []);

  return {
    generateAccompaniment,
    isLoading,
    isSuccess,
  };
}


async function checkAccompanimentResponseReady(id: string, onSuccess: () => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "completed") {
    console.log(result.tokens);
    onSuccess()
  } else {
    setTimeout(() => {
      checkAccompanimentResponseReady(id, onSuccess);
    }, 1000);
  }
}

import { useCallback, useRef, useState } from "react"
import { useSong } from "../hooks/useSong"
import { completeMidi, generateAccompanimentMidi, getMidiResponse } from "../services/AiService";
import { emptyTrack, isNoteEvent, programChangeMidiEvent } from "@signal-app/core";
import { usePianoRoll } from "../hooks/usePianoRoll"
import { notesToTokens, tokensToNotes } from "../utils/tokens";

export const useGenerateNotes = ({ onSuccess }: { onSuccess?: (explanation: string) => void } = {}) => {
  const { tracks } = useSong();
  const { setCandidateNotes, selectedTrack, setAiExplanation } = usePianoRoll();
  const selectedTrackRef = useRef(selectedTrack);
  selectedTrackRef.current = selectedTrack;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateNotes = useCallback(async (instrument: string) => {
    setIsLoading(true);
    setIsSuccess(false);

    if (tracks.length < 2) {
      setIsLoading(false);
      return;
    }
    if (!selectedTrack) {
      setIsLoading(false);
      return;
    }

    const notes = selectedTrack.events.filter(isNoteEvent);
    const tokens = notesToTokens(notes)

    const result = await completeMidi(tokens, instrument);
    console.log(result);

    setTimeout(async () => {
      checkMidiResponseReady(result.id, selectedTrack, (notes: any[], explanation: string) => {
        setIsLoading(false);
        setIsSuccess(true);
        setCandidateNotes(notes);
        setAiExplanation(explanation);
        if (onSuccess) {
          onSuccess(explanation);
        }
      });
    }, 1000);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks, selectedTrack, setCandidateNotes]);

  return {
    generateNotes,
    isLoading,
    isSuccess,
  };
}

async function checkMidiResponseReady(id: string, selectedTrack: any, setCandidateNotes: (notes: any[], explanation: string) => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "failed") {
    alert("Failed to generate MIDI completion.");
    return;
  }

  if (result.status === "completed") {
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
    setCandidateNotes(candidateNotes, result.explanation);
    return result.tokens;
  }
  setTimeout(() => {
    checkMidiResponseReady(id, selectedTrack, setCandidateNotes);
  }, 1000);
}

export const useGenerateAccompaniment = ({ onSuccess }: { onSuccess: () => void }) => {
  const { tracks, addTrack } = useSong();
  const lastTrackRef = useRef(tracks[tracks.length - 1] || null);
  lastTrackRef.current = tracks[tracks.length - 1] || null;

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // REWRITE: fix to actually add track with correct instrument (program number)
  const generateAccompaniment = useCallback(async (prompt: string, tokens: string, instrumentName: string, instrument: number) => {
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const result = await generateAccompanimentMidi(prompt, tokens, instrumentName);
      console.log(result);

      setTimeout(async () => {
        checkAccompanimentResponseReady(result.id, (tokens: string) => {
          // Assign a channel that is not 9 (drums) if possible, and not used
          // We'll keep it simple: find the next unused channel
          const usedChannels = tracks.map(t => t.channel).filter(n => typeof n === "number");
          let channel = 0;
          for (let i = 0; i < 16; i++) {
            if (!usedChannels.includes(i) && i !== 9) {
              channel = i;
              break;
            }
          }

          const newTrack = emptyTrack(channel);
          newTrack.channel = channel;

          // Fix: add the correct instrument (program change event) at start of this track
          const programChangeEvent: any = programChangeMidiEvent(0, channel, instrument);
          programChangeEvent.tick = 0;
          newTrack.addEvents([programChangeEvent]);

          const notes = tokensToNotes(tokens, 0);

          newTrack.addEvents(notes);
          addTrack(newTrack);

          setIsLoading(false);
          setIsSuccess(true);
          onSuccess();
        })
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      setIsSuccess(false);
      // Optionally handle errors
      console.error(err);
    }
  }, [tracks, addTrack, onSuccess]);

  return {
    generateAccompaniment,
    isLoading,
    isSuccess,
  };
}

async function checkAccompanimentResponseReady(id: string, onSuccess: (result: string) => void) {
  const result = await getMidiResponse(id);
  console.log(result);

  if (result.status === "completed") {
    onSuccess(result.tokens);
  } else {
    setTimeout(() => {
      checkAccompanimentResponseReady(id, onSuccess);
    }, 1000);
  }
}

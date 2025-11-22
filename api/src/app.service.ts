import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { MidiTokenProcessor } from './utils';
@Injectable()
export class AppService {
  constructor(private readonly midiTokenProcessor: MidiTokenProcessor) {}

  async generateMidi(midiPath: string, timebase: number): Promise<void> {
    const inputTokens = this.midiTokenProcessor.midiToTokens(
      midiPath,
      timebase,
    );
    const client = new OpenAI();
    const response = await client.responses.create({
      model: 'gpt-5-nano',
      instructions: `You are an AI music composer. The input below consists of a series of MIDI events, including tempo, note events, start times, and velocities. Your task is to "complete" the music while maintaining the rhythm, scale, mode, and musical consistency based on the given data. Ensure the melody flows naturally, respecting the existing patterns and structure. Extend the piece with new notes, rhythms, and harmonic progressions that fit within the existing context.

    Please extend the piece with additional notes, maintaining the rhythmic structure, and ensuring the harmony and progression stay consistent with the key and mode of the original piece. Ensure the music feels complete and flows naturally with the existing material.

    Provide the extended music in the same token format:
    - TEMPO [bpm]
    - TIMEBASE [timebase]
    - NOTE_ON [note] VELOCITY [velocity]
    - NOTE_START [startTime]
    - NOTE_END [endTime]
    - TIME_SHIFT [shiftTime]
    - NOTE_OFF [note]`,
      input: inputTokens,
    });

    console.log('INPUT TOKENS: ' + inputTokens);
    console.log('RESPONSE: ' + response.output_text);
    return this.midiTokenProcessor.processMidiFile(response.output_text);
  }

  // completeMidi(): string {
  //   return 'Hello World!';
  // }
}

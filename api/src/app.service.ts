import { Injectable } from '@nestjs/common';
import { MidiTokenProcessor } from './utils';
import { CreateResponseCommand } from './commands/create-response.command';

@Injectable()
export class AppService {
  constructor(private readonly midiTokenProcessor: MidiTokenProcessor) {}

  async completeMidi(tokens: string, timebase: number): Promise<void> {
    const createResponse = new CreateResponseCommand();

    const instructions = `You are an AI music composer. The input below consists of a series of MIDI events, including tempo, note events, start times, and velocities. Your task is to "complete" the music while maintaining the rhythm, scale, mode, and musical consistency based on the given data. Ensure the melody flows naturally, respecting the existing patterns and structure. Extend the piece with new notes, rhythms, and harmonic progressions that fit within the existing context.

    Please extend the piece with additional notes, maintaining the rhythmic structure, and ensuring the harmony and progression stay consistent with the key and mode of the original piece. Ensure the music feels complete and flows naturally with the existing material.

    Provide the extended music in the same token format:
    - TEMPO [bpm]
    - TIMEBASE [timebase]
    - NOTE_ON [note] VELOCITY [velocity]
    - NOTE_START [startTime]
    - NOTE_END [endTime]
    - TIME_SHIFT [shiftTime]
    - NOTE_OFF [note]`;


    const response = await createResponse.execute({
      model: 'gpt-5-nano',
      input: tokens,
      instructions,
    });

    console.log('RESPONSE: ' + response);
    return this.midiTokenProcessor.processMidiFile(response);
  }

  async generateMidi(input: string): Promise<void> {
    const createResponse = new CreateResponseCommand();
    const instructions = `You are an AI music composer. The user will provide a natural-language description of a musical idea, such as a melody, mood, style, tempo, rhythm, or harmonic feel.

Your task is to compose a complete piece of music based on the user's description and output it as a sequence of structured MIDI-like tokens.

You MUST generate music that is coherent, stylistically consistent, and musically meaningful. Follow the user’s intent regarding genre, mood, tempo, complexity, scale, and instrumentation as closely as possible. If the user specifies no musical constraints, choose reasonable defaults.

The output MUST follow this exact token format:

- TEMPO [bpm]
- TIMEBASE [timebase]
- NOTE_ON [note] VELOCITY [velocity]
- NOTE_START [startTime]
- NOTE_END [endTime]
- TIME_SHIFT [shiftTime]
- NOTE_OFF [note]

Rules:
- Output ONLY valid tokens in this format, nothing else.
- All notes must include NOTE_ON, NOTE_START, NOTE_END, and NOTE_OFF in the correct order.
- Time values must be consistent, non-negative, and increasing.
- Always begin with TEMPO and TIMEBASE.
- Melody, rhythm, scale, and harmony must reflect the user's description.
- Ensure the piece is complete, structured, and musically coherent.
- Avoid text explanations or comments. Only output the tokens.`;

    const response = await createResponse.execute({
      model: 'gpt-5-nano',
      input,
      instructions,
    });

    console.log('RESPONSE: ' + response);
    return this.midiTokenProcessor.processMidiFile(response);
  }
}

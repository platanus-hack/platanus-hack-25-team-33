import { Injectable } from '@nestjs/common';
import { MidiTokenProcessor } from './utils';
import { CreateResponseCommand } from './commands/create-response.command';

@Injectable()
export class AppService {
  constructor(private readonly midiTokenProcessor: MidiTokenProcessor) {}

  async completeMidi(
    tokens: string,
    timebase: number,
    model?: string,
    measure?: number,
  ): Promise<void> {
    const createResponse = new CreateResponseCommand();

    const instructions = `Please extend the piece with additional notes, ensuring that the rhythmic structure is varied and the harmony and progression stay consistent with the key and mode of the original piece. The melody should flow naturally and maintain musical cohesion with the existing material.

### Specific Instructions:
1. **Note Duration Variety**: The duration of the notes should vary significantly. Avoid making all the notes the same duration. Include a variety of note lengths such as **eighth notes**, **quarter notes**, **half notes**, **dotted rhythms**, and even **longer note durations** (whole notes). Do not generate notes with the same fixed distance between them (e.g., don't make all the notes 0.5 apart).
2. **Irregular Timing**: Ensure that the timing between notes (note start and end) varies. There should be **a natural variety** in the spacing between notes to give the piece a dynamic and expressive feel. Some notes can be closely spaced, while others should be further apart.
3. **Phrasing and Rhythm**: The rhythm should feel natural, with **syncopation**, **rests**, and **dynamic phrasing**. The note durations should not follow a fixed, repetitive pattern (such as every note being a quarter note or every note spaced the same).
4. **Number of Compasses**: Extend the music to complete **${measure || 1} compasses** (measures) of music. Ensure that the extension feels like a seamless continuation of the existing material, with appropriate harmonic progressions and melodic movement.

Please provide the extended music in the same token format:
- TEMPO [bpm]
- TIMEBASE [timebase]
- NOTE_ON [note] VELOCITY [velocity]
- NOTE_START [startTime]
- NOTE_END [endTime]
- TIME_SHIFT [shiftTime]
- NOTE_OFF [note]`;

    const before = Date.now();
    const response = await createResponse.execute({
      model: model || 'gpt-5-nano',
      input: tokens,
      instructions,
    });

    const timeInMinutes = (Date.now() - before) / 60000;
    console.log(
      'Took ' + timeInMinutes.toFixed(2) + ' minutes to generate the response.',
    );

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

    return this.midiTokenProcessor.processMidiFile(response);
  }
}

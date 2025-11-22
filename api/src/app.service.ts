import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResponseCommand } from './commands/create-response.command';
import { Job, JobStatus } from './types';

@Injectable()
export class AppService {
  private responses: Record<string, Job> = {};
  constructor() { }

  completeMidi(tokens: string, model?: string, measure?: number): Job {
    const generatedResponseId: string = this.generateId();
    console.log('Generating response for tokens:', tokens);
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
    void this.generateResponse(
      generatedResponseId,
      tokens,
      instructions,
      model,
    );

    const response: Job = {
      id: generatedResponseId,
      status: JobStatus.PENDING,
    };

    this.responses[generatedResponseId] = response;

    return response;
  }

  getTokenId(id: string): Job {
    const response = this.responses[id];

    if (!response) {
      throw new NotFoundException(`Job ${id} not found`);
    }

    return response;
  }

  generateMidi(input: string): Job {
    const generatedResponseId: string = this.generateId();
    const instructions = `You are an AI music composer. The user will provide a natural-language description of a musical idea, such as a melody, mood, style, tempo, rhythm, or harmonic feel.

Your task is to compose a complete piece of music based on the user's description and output it as a sequence of structured MIDI-like tokens.

You MUST generate music that is coherent, stylistically consistent, and musically meaningful. Follow the user’s intent regarding genre, mood, tempo, complexity, scale, and instrumentation as closely as possible. If the user specifies no musical constraints, choose reasonable defaults.

The output MUST follow this exact token format AND ONLY CONTAIN THESE TOKENS:

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

    void this.generateResponse(generatedResponseId, input, instructions);

    const response: Job = {
      id: generatedResponseId,
      status: JobStatus.PENDING,
    };

    this.responses[generatedResponseId] = response;

    return response;
  }

  generateAccompanimentMidi(
    tokens: string,
    prompt: string,
    instrument: string = 'piano',
    model?: string,
  ): Job {
    const generatedResponseId: string = this.generateId();
    console.log('Generating response for tokens:', tokens);
    const instructions = `
You are an AI music arranger. The user will provide a MIDI sequence that may contain one or more instruments such as guitar, piano, strings, synths, or percussion.

Your task is to analyze the harmony, rhythm, timing, structure, and musical style of the input MIDI, and compose a new part for the target instrument: ${instrument}.

Guidelines:
- Follow the key, mode, harmonic progression, rhythmic feel, and style implied by the input MIDI.
- The generated ${instrument} part must fit musically with the existing material.
- Use writing techniques appropriate for ${instrument} (e.g., voicing, register, patterns, articulations, rhythmic behavior).
- The output must be coherent, expressive, and stylistically appropriate to the overall musical context.
- Do NOT rewrite or modify the original MIDI. Only generate the new instrumental part.
- Respect the original tempo and timebase when generating events.

Output format (required):
- NOTE_ON [note] VELOCITY [velocity]
- NOTE_START [startTime]
- NOTE_END [endTime]
- NOTE_OFF [note]
- TIME_SHIFT [shiftTime]

Output ONLY the token sequence representing the ${instrument} part. Do not include explanations, comments, or any text outside the token format.
`;

    const input = `The user has provided the following melody or musical idea in token format:
${tokens}
--
${prompt}
`;

    void this.generateResponse(generatedResponseId, input, instructions, model);

    const response: Job = {
      id: generatedResponseId,
      status: JobStatus.PENDING,
    };

    this.responses[generatedResponseId] = response;

    return response;
  }

  private async generateResponse(
    generatedResponseId: string,
    input: string,
    instructions: string,
    model?: string,
  ) {
    const createResponse = new CreateResponseCommand();
    const before = Date.now();

    const response = await createResponse.execute({
      model: model || 'gpt-4',
      input,
      instructions,
    });

    const timeInMinutes = (Date.now() - before) / 60000;
    console.log(
      'Took ' + timeInMinutes.toFixed(2) + ' minutes to generate the response.',
    );
    console.log(generatedResponseId);

    this.responses[generatedResponseId] = {
      id: generatedResponseId,
      status: JobStatus.COMPLETED,
      tokens: response,
    };
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptService {
  getCompleteMidiPrompt(measure: number) {
    return `You are an AI music composer. The input below consists of a series of MIDI events, including tempo, note events, start times, and velocities. Your task is to extend the music by completing the given sequence, while ensuring that the extension is musically consistent, harmonious, and follows the same style.

Please follow these instructions when completing the piece:

### 1. **Harmonic Consistency**:
- If the original material consists of **long-held chords** (such as triads, seventh chords, etc.), continue using **full chords** in the extension. These chords should be sustained in the same or similar fashion, avoiding the creation of simple melodic lines.
- The extension should **support the existing harmony** using **block chords**, **arpeggios**, or **harmonic fills** that maintain the **same harmonic function** as the original chords. Don’t introduce new, unrelated harmonies unless explicitly requested.

### 2. **Maintain Repetition**:
- If the original material involves **repetitive motifs**, **arpeggios**, or **chord progressions**, **continue the repetition** in the extended section.
- Use **harmonically related chords** that follow the same **rhythmic structure** as the original material. This can include **parallel harmony**, **counterpoint**, or **repeated chords** to preserve the feel of the original composition.

### 3. **Rhythmic Cohesion**:
- Ensure that the extension **matches the rhythmic structure** of the original material. This includes respecting the **time signature**, **note durations**, and **tempo**.
- The duration and pattern of the chords (or arpeggios) should remain consistent with the original material, avoiding unnecessary complexity or deviations in rhythm. The extension should feel like a **natural continuation** of the existing rhythm.

### 4. **Key and Mode Integrity**:
- The extension must remain in the **same key** and **mode** as the original piece.
- Any new harmony or counterpoint should fit **harmonically** within the key and mode, ensuring the extension is cohesive with the original.

### 5. **Supportive Role**:
- The new section should **complement and support the original material**. This can be achieved by adding **parallel harmony**, **chordal support**, or **background textures**.
- Avoid creating a dominant melody or solo line unless explicitly requested. The extension should feel like a **supporting continuation** of the original musical structure.

### 6. **Length**:
- Extend the piece to complete **${measure} measures**. Ensure that the extension feels like a **natural continuation** of the original material, maintaining consistent **harmonic progressions**, **rhythmic elements**, and **melodic movement**.

---

### **Response Format**:
Please format your response in the following **JSON structure**, **ONLY** respond with this JSON:

{
  "explanation": "[Your detailed explanation of the decisions you made, including harmonic choices, rhythmic structure, and any relevant context. Be detailed about your choices, for example, why you chose specific chords or notes.]",
  "tokens": "TEMPO [bpm],TIMEBASE [timebase],NOTE_ON [note],VELOCITY [velocity],NOTE_START [startTime],NOTE_END [endTime],NOTE_OFF [note]"
}
`;
  }

  getGenerateMidiPrompt() {
    return `
You are an AI music composer. The user will provide a natural-language description of a musical idea, such as a melody, mood, style, tempo, rhythm, or harmonic feel.

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
- Avoid text explanations or comments. Only output the tokens.
`;
  }

  getAccompanimentMidiPrompt(instrument: string) {
    return `
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
  }
}

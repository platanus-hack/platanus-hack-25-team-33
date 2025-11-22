import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResponseCommand } from './commands/create-response.command';
import { Job, JobStatus } from './types';
import { PromptService } from './prompt.service';
interface MidiResponse {
  explanation: string;
  tokens: string;
}

@Injectable()
export class AppService {
  private responses: Record<string, Job> = {};
  constructor(private readonly promptService: PromptService) {}

  completeMidi(
    tokens: string,
    instrument: string,
    measure: number,
    model?: string,
  ): Job {
    const generatedResponseId: string = this.generateId();
    console.log('Generating response for tokens:', tokens);
    const instructions = this.promptService.getCompleteMidiPrompt(measure);
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
    const instructions = this.promptService.getGenerateMidiPrompt();

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
    const instructions =
      this.promptService.getAccompanimentMidiPrompt(instrument);
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

    let parsedResponse: MidiResponse;

    try {
      parsedResponse = JSON.parse(
        response
          .replace(/\\n/g, '\n') // Replace escaped newlines (\n) with actual newlines
          .replace(/(\n)(?=(?!.*"tokens":))/g, ' ') // Remove newlines outside the tokens field
          .trim(),
      ) as MidiResponse;
    } catch (error) {
      console.error('Error parsing response:', error);
      this.responses[generatedResponseId] = {
        id: generatedResponseId,
        status: JobStatus.FAILED,
        tokens: '',
        explanation: '',
      };
      return;
    }

    // Extract explanation and tokens
    const explanation =
      parsedResponse.explanation || 'No explanation provided.';
    const tokens = parsedResponse.tokens || 'No tokens provided.';

    this.responses[generatedResponseId] = {
      id: generatedResponseId,
      status: JobStatus.COMPLETED,
      tokens: tokens,
      explanation: explanation,
    };
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

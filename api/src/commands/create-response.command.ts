import OpenAI from 'openai';

export interface CompletionCommandParams {
  input: string;
  instructions: string;
  model?: string; // defaults to 'gpt-4o-mini'
}

export class CreateResponseCommand {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI();
  }

  async execute({
    input,
    instructions,
    model = 'gpt-4o-mini',
  }: CompletionCommandParams): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model,
        instructions,
        input,
      });

      console.log(response);
      return response.output_text;
    } catch (error) {
      throw new Error('Failed to parse: ' + error);
    }
  }
}

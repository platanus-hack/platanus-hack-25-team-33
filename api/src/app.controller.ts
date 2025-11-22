import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { type Job } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('completeMidi')
  completeMidi(
    @Body()
    body: {
      tokens: string;
      instrument: string;
      model?: string;
      measure?: number;
    },
  ): Job {
    const { tokens, instrument, model, measure } = body;
    return this.appService.completeMidi(
      tokens,
      instrument,
      measure ?? 1,
      model,
    );
  }

  @Get('/token/:id')
  completedMidi(@Param('id') id: string): Job {
    return this.appService.getTokenId(id);
  }

  @Post('generateMidi')
  generateMidi(@Body() body: { prompt: string }): Job {
    const { prompt } = body;
    return this.appService.generateMidi(prompt);
  }

  @Post('generateAccompanimentMidi')
  generateAccompanimentMidi(
    @Body() body: { prompt: string; tokens: string; instrument: string },
  ): Job {
    const { prompt, tokens, instrument } = body;
    return this.appService.generateAccompanimentMidi(
      prompt,
      tokens,
      instrument,
    );
  }
}

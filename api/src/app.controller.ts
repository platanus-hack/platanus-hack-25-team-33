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
      model?: string;
      measure?: number;
    },
  ): Job {
    const { tokens, model, measure } = body;
    return this.appService.completeMidi(tokens, model, measure);
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
}

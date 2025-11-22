import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

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
  ): string {
    const { tokens, model, measure } = body;
    return this.appService.completeMidi(tokens, model, measure);
  }

  @Get('/token/:id')
  completedMidi(@Param('id') id: string): string {
    return this.appService.getTokenId(id);
  }

  @Post('generateMidi')
  generateMidi(@Body() body: { prompt: string }): void {
    console.log(body);
    const { prompt } = body;
    void this.appService.generateMidi(prompt);
  }
}

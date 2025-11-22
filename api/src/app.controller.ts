import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('completeMidi')
  completeMidi(
    @Body()
    body: {
      midiPath: string;
      timebase: number;
      model?: string;
      measure?: number;
    },
  ): void {
    const { midiPath, timebase, model, measure } = body;
    this.appService.completeMidi(midiPath, timebase, model,measure);
  }

  @Post('generateMidi')
  generateMidi(@Body() body: { prompt: string }): void {
    console.log(body);
    const { prompt } = body;
    this.appService.generateMidi(prompt);
  }
}

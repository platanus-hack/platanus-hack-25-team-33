import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('completeMidi')
  completeMidi(@Body() body: { tokens: string; timebase: number }): void {
    const { tokens, timebase } = body;
    this.appService.completeMidi(tokens, timebase);
  }

  @Post('generateMidi')
  generateMidi(@Body() body: { prompt: string }): void {
    console.log(body);
    const { prompt } = body;
    this.appService.generateMidi(prompt);
  }
}

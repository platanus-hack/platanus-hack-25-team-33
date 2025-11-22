import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('generateMidi')
  generateMidi(@Body() body: { midiPath: string; timebase: number }): void {
    console.log(body);
    const { midiPath, timebase } = body;
    this.appService.generateMidi(midiPath, timebase);
  }
}

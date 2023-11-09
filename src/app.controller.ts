import { Controller, Get, Render, Req } from '@nestjs/common';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService, // private readonly deviceService: DeviceService, // private readonly sensorService: SensorService,
  ) {}

  @Get()
  async root() {
    return 'Hello World!';
  }
}

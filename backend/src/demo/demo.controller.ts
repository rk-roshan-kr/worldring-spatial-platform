import { Controller, Get } from '@nestjs/common';
import { DemoService, SpatialEnvironment, RouteGuide } from './demo.service';

@Controller('api/demo')
export class DemoController {
  constructor(private readonly demoService: DemoService) {}

  @Get('environment')
  getEnvironment(): SpatialEnvironment {
    return this.demoService.getEnvironment();
  }

  @Get('route')
  getRoute(): RouteGuide {
    return this.demoService.getRoute();
  }
}

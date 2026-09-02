import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getRoot() {
    return {
      name: 'Earthos Lab Core API',
      status: 'ONLINE',
      stage: 'Theoretical Thesis & Prototype Benchmarks',
      version: '0.2.0-alpha',
      endpoints: {
        demoEnvironment: '/api/demo/environment',
        demoRoute: '/api/demo/route',
        pipelineStatus: '/api/pipeline/status',
        datasetSample: '/api/datasets/example',
        contact: 'POST /api/contact'
      }
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}

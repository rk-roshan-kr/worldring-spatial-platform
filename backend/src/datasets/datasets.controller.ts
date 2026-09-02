import { Controller, Get } from '@nestjs/common';
import { DatasetsService } from './datasets.service';

@Controller('api/datasets')
export class DatasetsController {
  constructor(private readonly datasetsService: DatasetsService) {}

  @Get('example')
  getExample() {
    return this.datasetsService.getExample();
  }
}

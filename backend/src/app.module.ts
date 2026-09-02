import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DemoModule } from './demo/demo.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { DatasetsModule } from './datasets/datasets.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    DemoModule,
    PipelineModule,
    DatasetsModule,
    ContactModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

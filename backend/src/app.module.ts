import { V1ApiModule } from './v1/v1-api.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    V1ApiModule
  ]
})

export class AppModule { }

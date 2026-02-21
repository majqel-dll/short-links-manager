import { DatabaseModule } from '@libs/database';
import { Logger } from './logger.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    DatabaseModule
  ],
  providers: [
    Logger
  ],
  exports: [
    Logger
  ],
})

export class LoggerModule { }

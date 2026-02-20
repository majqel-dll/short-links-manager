import { Module } from '@nestjs/common';
import { EnumsService } from './enums.service';

@Module({
  providers: [EnumsService],
  exports: [EnumsService],
})
export class EnumsModule {}

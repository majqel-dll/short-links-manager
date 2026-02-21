import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getLoggerToken } from '@libs/decorators';
import { DatabaseModule } from '@libs/database';
import { LogEntity } from '@libs/entities';
import { LoggerTarget } from '@libs/types';
import { Logger } from './logger.service';
import { Repository } from 'typeorm';

@Global()
@Module({
  imports: [
    DatabaseModule,
  ]
})

export class LoggerModule {

  public static forFeature(
    targets: Type<LoggerTarget>[] | Type<LoggerTarget>
  ): DynamicModule {
    if (!Array.isArray(targets)) { targets = [targets] }
    const providers = targets.map(target => ({
      provide: getLoggerToken(target),
      useFactory: (logRepository: Repository<LogEntity>) => {
        return new Logger(logRepository, target?.name || undefined)
      },
      inject: [
        getRepositoryToken(LogEntity),
      ]
    }))

    return {
      module: LoggerModule,
      providers,
      exports: providers,
    }
  }

}
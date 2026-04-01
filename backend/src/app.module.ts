import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { Logger, LoggerModule, RequestLoggingMiddleware, ResponseLoggingExceptionFilterProvider, ResponseLoggingInterceptorProvider } from '@libs/logger';
import { onBootstrapMessageUtil } from '@libs/utils';
import { ThrottlerModule } from '@nestjs/throttler';
import { V1ApiModule } from './v1/v1-api.module';
import { DatabaseModule } from '@libs/database';
import { InjectLogger } from '@libs/decorators';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.SECRET,
      signOptions: {
        algorithm: `HS512`,
        expiresIn: `30d`,
      }
    }),
    LoggerModule.forFeature([
      AppModule,
      RequestLoggingMiddleware
    ]),
    DatabaseModule,
    V1ApiModule
  ],
  providers: [
    ResponseLoggingExceptionFilterProvider,
    ResponseLoggingInterceptorProvider,
  ]
})

export class AppModule implements OnModuleInit, NestModule {

  constructor(
    @InjectLogger(AppModule) private readonly logger: Logger,
  ) { }

  public configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes(
      { path: ``, method: RequestMethod.ALL },
      { path: `*route`, method: RequestMethod.ALL },
    );
  };

  public onModuleInit() {
    void onBootstrapMessageUtil(AppModule.name, this.logger);
  };

}

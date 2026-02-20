import { ConfigModule } from '@nestjs/config';
import { V1ApiModule } from './v1/v1-api.module';
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '@libs/database';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.SECRET }),
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot(),
    DatabaseModule,
    V1ApiModule
  ]
})

export class AppModule { }

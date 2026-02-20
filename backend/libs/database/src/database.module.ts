import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

const entities = [];

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: `postgres`,
      host: process.env.MAIN_DATABASE_HOST,
      port: Number(process.env.MAIN_DATABASE_PORT),
      username: process.env.MAIN_DATABASE_USER,
      password: process.env.MAIN_DATABASE_PASS,
      database: process.env.MAIN_DATABASE_NAME,
      entities: entities,
      synchronize: true
    }),
  ],
  exports: [
    TypeOrmModule.forFeature(entities)
  ],
})
export class DatabaseModule { }

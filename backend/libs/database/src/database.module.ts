import { TypeOrmModule } from '@nestjs/typeorm';
import * as Entities from "@libs/entities";
import { Module } from '@nestjs/common';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: `postgres`,
      host: process.env.MAIN_DATABASE_HOST,
      port: Number(process.env.MAIN_DATABASE_PORT),
      username: process.env.MAIN_DATABASE_USER,
      password: process.env.MAIN_DATABASE_PASS,
      database: process.env.MAIN_DATABASE_NAME,
      entities: Object.values(Entities),
      synchronize: true
    }),
    TypeOrmModule.forFeature(Object.values(Entities))
  ],
  exports: [
    TypeOrmModule.forFeature(Object.values(Entities))
  ],
})
export class DatabaseModule { }

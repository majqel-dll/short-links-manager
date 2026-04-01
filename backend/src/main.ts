import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger({
            timestamp: true,
            depth: 6,
        }),
    });

    const expresss = app.getHttpAdapter().getInstance() as import("express").Express;
    expresss.set("trust proxy", true);
    expresss.disable("x-powered-by");

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            always: true,
        }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    app.use(helmet());

    await app.listen(3000);
}

bootstrap();

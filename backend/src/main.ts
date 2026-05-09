import { SwaggerModule, DocumentBuilder, type OpenAPIObject } from "@nestjs/swagger";
import { ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap(): Promise<void> {
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
            forbidUnknownValues: true,
            always: true,
        }),
    );

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.use(cookieParser());
    app.use(helmet());

    const config = new DocumentBuilder()
        .setTitle(`Short-links-manager API`)
        .setDescription(`API documentation for the Short-links-manager application.`)
        .setVersion(`1.0`)
        .build();

    const documentFactory = (): OpenAPIObject => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, documentFactory, {
        jsonDocumentUrl: `swagger/json`,
        customSiteTitle: `Short-links-manager API`,
        customCss: `.swagger-ui .topbar { display: none !important; }`,
    });

    await app.listen(3000);
}

void bootstrap();

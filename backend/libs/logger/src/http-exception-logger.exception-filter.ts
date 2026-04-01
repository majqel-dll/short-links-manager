import { calculateSize, detectResponseType, getCodeFromExceptionOrNull } from "@libs/utils";
import { ArgumentsHost, Catch, ExceptionFilter, Provider } from "@nestjs/common";
import { APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpResponseEntity } from "@libs/entities";
import { InjectLogger } from "@libs/decorators";
import { Request, Response } from "express";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";

@Catch()
export class HttpExceptionLogger extends BaseExceptionFilter implements ExceptionFilter {

    constructor(
        @InjectRepository(HttpResponseEntity)
        private readonly httpResponseRepository: Repository<HttpResponseEntity>,
        @InjectLogger(HttpExceptionLogger) private readonly logger: Logger,
    ) {
        super();
    };

    public catch(exception: unknown, host: ArgumentsHost): void {

        const startTime: number = Date.now();
        const response = host.switchToHttp().getResponse();
        const request = host.switchToHttp().getRequest();

        super.catch(exception, host);

    };

    public async noticeErrorResponse(
        error: unknown,
        request: Request,
        response: Response,
        startTime: number,
    ): Promise<void> {

        const duration = Date.now() - startTime;
        const statusCode = getCodeFromExceptionOrNull(error) ?? response?.statusCode?.toString() ?? `unknown`;
        const responseType = detectResponseType(error);
        const size = calculateSize(error);
        const message = `Responded ${responseType} (${statusCode}) after ${duration}ms, with ${size} bytes of data.`;

        const responseRecord = this.httpResponseRepository.create({});

    };

};

export const HttpExceptionLoggerProvider: Provider = {
    provide: APP_FILTER,
    useClass: HttpExceptionLogger,
};
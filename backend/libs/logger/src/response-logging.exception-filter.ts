import { calculateSize, detectResponseType, getCodeFromExceptionOrNull } from "@libs/utils";
import { ArgumentsHost, Catch, ExceptionFilter, Provider } from "@nestjs/common";
import { APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { HttpResponseEntity } from "@libs/entities";
import { InjectLogger } from "@libs/decorators";
import { Request, Response } from "express";
import { LogTypeEnum } from "@libs/enums";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";

@Catch()
export class ResponseLoggingExceptionFilter extends BaseExceptionFilter implements ExceptionFilter {

    constructor(
        @InjectRepository(HttpResponseEntity)
        private readonly httpResponseRepository: Repository<HttpResponseEntity>,
        @InjectLogger(ResponseLoggingExceptionFilter) private readonly logger: Logger,
    ) {
        super();
    };

    public catch(exception: unknown, host: ArgumentsHost): void {
        const startTime: number = Date.now();
        const response = host.switchToHttp().getResponse();
        const request = host.switchToHttp().getRequest();
        void this.noticeErrorResponse(exception, request, response, startTime);
        super.catch(exception, host);
    };

    public async noticeErrorResponse(
        error: unknown,
        request: Request,
        response: Response,
        startTime: number,
    ): Promise<void> {

        const duration = Date.now() - startTime;
        const statusCode = Number(getCodeFromExceptionOrNull(error) ?? response?.statusCode);
        const responseType = detectResponseType(error);
        const size = calculateSize(error);
        const requestUuid = request.executionId;

        const message = `Responded ${responseType} (${statusCode}) after ${duration}ms, with ${size} bytes of data.`;
        const responseRecord = this.httpResponseRepository.create({
            size, error, statusCode, duration, requestUuid,
        });

        await this.httpResponseRepository.save(responseRecord);
        this.logger.log(message, { startTime, tag: LogTypeEnum.NOTIFICATION });

    };

};

export const ResponseLoggingExceptionFilterProvider: Provider = {
    provide: APP_FILTER,
    useClass: ResponseLoggingExceptionFilter,
};
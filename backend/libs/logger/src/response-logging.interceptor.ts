import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    Provider,
} from "@nestjs/common";
import { calculateSize, detectResponseType } from "@libs/utils";
import { HttpResponseEntity } from "@libs/entities";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Request, Response } from "express";
import { LogTypeEnum } from "@libs/enums";
import { Observable, tap } from "rxjs";
import { Logger } from "@libs/logger";
import { Repository } from "typeorm";

@Injectable()
export class ResponseLoggingInterceptor implements NestInterceptor {
    constructor(
        @InjectRepository(HttpResponseEntity)
        private readonly httpResponseRepository: Repository<HttpResponseEntity>,
        @InjectLogger(ResponseLoggingInterceptor)
        private readonly logger: Logger,
    ) {
        this.logger.log(`Response logging interceptor has been successfully initialized.`, {
            startTime: Date.now(),
            tag: LogTypeEnum.INTERNAL_ACTION,
        });
    }

    public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
        const startTime: number = Date.now();
        const httpCtx = context.switchToHttp();
        const response: Response = httpCtx.getResponse();
        const request: Request = httpCtx.getRequest();

        return next
            .handle()
            .pipe(
                tap(
                    (data) =>
                        void this.noticeResponse(data, response, startTime, request?.executionId),
                ),
            );
    }

    private async noticeResponse(
        data: unknown,
        response: Response,
        startTime: number,
        requestUuid?: string,
    ): Promise<void> {
        const duration = Date.now() - startTime;
        const statusCode = response?.statusCode;
        const responseType = detectResponseType(data);
        const sizeInBytes = calculateSize(data);
        const message = `Responded ${responseType} (${statusCode}) after ${duration}ms, with ${sizeInBytes} bytes.`;

        const responseRecord = this.httpResponseRepository.create({
            size: sizeInBytes,
            statusCode,
            duration,
            requestUuid,
        });

        await this.httpResponseRepository.save(responseRecord);
        this.logger.log(message, { startTime, tag: LogTypeEnum.NOTIFICATION });
    }
}

export const ResponseLoggingInterceptorProvider: Provider = {
    provide: APP_INTERCEPTOR,
    useClass: ResponseLoggingInterceptor,
};

import { Injectable, NestMiddleware, OnModuleInit } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, Repository } from "typeorm";
import { InjectLogger } from "@libs/decorators";
import { ActiveUserPayload } from "@libs/types";
import { randomUUID as uuidv4 } from "crypto";
import { LogTypeEnum } from "@libs/enums";
import { JwtService } from "@nestjs/jwt";
import { Logger } from "@libs/logger";
import {
    HttpRequestEntity,
    HttpRequestHeaderEntity,
    HttpIpAddressEntity,
} from "@libs/entities";

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware, OnModuleInit {
    constructor(
        @InjectRepository(HttpRequestHeaderEntity)
        private readonly headersRepository: Repository<HttpRequestHeaderEntity>,
        @InjectRepository(HttpRequestEntity)
        private readonly requestRepository: Repository<HttpRequestEntity>,
        @InjectRepository(HttpIpAddressEntity)
        private readonly ipRepository: Repository<HttpIpAddressEntity>,
        @InjectLogger(RequestLoggingMiddleware)
        private readonly logger: Logger,
        private readonly jwtService: JwtService,
    ) {}

    public onModuleInit(): void {
        void this.logger.log(`Monitoring middleware has been initialized.`, {
            startTime: Date.now(),
            tag: LogTypeEnum.INTERNAL_ACTION,
        });
    }

    private async extractUserId(req: Request): Promise<number> {
        const startTime: number = Date.now();
        try {
            let token = req.cookies?.[`accessToken`];
            if (!token) {
                const header = req.headers?.[`authorization`];
                token = header?.split(` `).at(1);
            }

            if (!token) {
                return null;
            }

            const payload: ActiveUserPayload = await this.jwtService.verifyAsync(token, {
                secret: process.env.SECRET,
            });

            return payload.id;
        } catch (error) {
            let message = `Failed to extract user key in monitoring middleware.`;
            const errorPayload = {
                startTime,
                tag: LogTypeEnum.AUTHORIZATION_FAIL,
                error: error as Error,
            };

            if (error instanceof Error && error.name === "TokenExpiredError") {
                let token = req.cookies?.[`accessToken`];
                if (!token) {
                    const header = req.headers?.[`authorization`];
                    token = header?.split(` `).at(1);
                }

                const payload: ActiveUserPayload = await this.jwtService.decode(token);
                if (payload?.id) {
                    return payload.id;
                }

                message = `Received expired token in monitoring middleware.`;
            }

            void this.logger.error(message, errorPayload);
            return null;
        }
    }

    private async saveRequestData(req: Request): Promise<void> {
        const startTime: number = Date.now();
        try {
            const userId = await this.extractUserId(req);
            const cloudFlareIp = req?.headers?.["cf-connecting-ip"];
            const ip =
                (Array.isArray(cloudFlareIp) ? cloudFlareIp.at(0) : cloudFlareIp) ?? req.ip;

            let existingIp: HttpIpAddressEntity | null = null;
            if (ip) {
                await this.ipRepository.upsert({ value: ip }, [`value`]);
                existingIp = await this.ipRepository.findOne({
                    where: { value: ip },
                });
            }

            const { headers } = req;
            const headerEntry = await this.headersRepository.save({
                userAgent: headers?.["user-agent"] ?? null,
                accept: headers?.accept ?? null,
                acceptEncoding: headers?.["accept-encoding"] ?? null,
                referer: headers?.referer ?? null,
                origin: headers?.origin ?? null,
                host: headers?.host ?? null,
                contentType: headers?.["content-type"] ?? null,
            } as DeepPartial<HttpRequestHeaderEntity>);

            const requestEntry = this.requestRepository.create({
                requestUuid: req.executionId,
                requestTimestamp: new Date(),
                method: req?.method ?? null,
                headers: headerEntry,
                url: req?.originalUrl ?? null,
                path: req?.path ?? null,
                ipAddresses: req?.ips ?? null,
                hostname: req?.hostname ?? null,
                protocol: req?.protocol ?? null,
                params: req?.params ?? null,
                query: req?.query ?? null,
                body:
                    req?.body && typeof req.body === `object`
                        ? this.cleanBody(structuredClone(req.body))
                        : null,
                ipId: existingIp?.id ?? null,
                userId: userId ?? null,
            } as DeepPartial<HttpRequestEntity>);

            const requestRecord = await this.requestRepository.save(requestEntry);
            if (!req.userId) {
                req.userId = userId;
            }
            req.requestEntityId = requestRecord.id;

            void this.logger.log(`Request has been spotted and registered.`, {
                startTime,
                tag: LogTypeEnum.NOTIFICATION,
            });
        } catch (error) {
            void this.logger.error(`Failed to save request properties in database.`, {
                startTime,
                error: error as Error,
                tag: LogTypeEnum.NOTIFICATION,
            });
            void this.logger.warn(`---------------------------------`, {
                startTime,
                tag: LogTypeEnum.NOTIFICATION,
            });
            void this.logger.warn(`Requested path: ${req?.path ?? `unknown`}`, {
                startTime,
                tag: LogTypeEnum.NOTIFICATION,
            });
            void this.logger.warn(`Requested method: ${req?.method ?? `unknown`}`, {
                startTime,
                tag: LogTypeEnum.NOTIFICATION,
            });
            void this.logger.warn(`Requested from IP: ${req?.ip ?? `unknown`}`, {
                startTime,
                tag: LogTypeEnum.NOTIFICATION,
            });

            if (req.headers) {
                void this.logger.warn(`Request headers: ${JSON.stringify(req.headers)}`, {
                    startTime,
                    tag: LogTypeEnum.NOTIFICATION,
                });
            }

            if (req.params) {
                void this.logger.warn(`Request params: ${JSON.stringify(req.params)}`, {
                    startTime,
                    tag: LogTypeEnum.NOTIFICATION,
                });
            }

            if (req.body) {
                void this.logger.warn(`Requested body: ${JSON.stringify(req.body)}`, {
                    startTime,
                    tag: LogTypeEnum.NOTIFICATION,
                });
            }
        }
    }

    private cleanBody<T extends object>(body: T): T {
        const keys = [
            `password`,
            `newPassword`,
            `confirmNewPassword`,
            `currentPassword`,
            `token`,
        ];
        keys.forEach((key) => {
            if (key in body) {
                delete body[key];
            }
        });
        return body;
    }

    public use(req: Request, _: Response, next: NextFunction): void {
        const requestId = uuidv4();
        req.processingStartTime = new Date();
        req.executionId = requestId;
        void this.saveRequestData(req);
        next();
    }
}

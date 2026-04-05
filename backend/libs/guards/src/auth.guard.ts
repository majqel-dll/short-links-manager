import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthTypeEnum, LogTypeEnum, MetadataKeyEnum } from "@libs/enums";
import { BearerTokenGuardService } from "./bearer-token-guard.service";
import { CookieGuardService } from "./cookie-guard.service";
import { InjectLogger } from "@libs/decorators";
import { Reflector } from "@nestjs/core";
import { Logger } from "@libs/logger";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @InjectLogger(AuthGuard) private readonly logger: Logger,
        private readonly bearerGuard: BearerTokenGuardService,
        private readonly cookieGuard: CookieGuardService,
        private readonly reflector: Reflector,
    ) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const startTime: number = Date.now();
        const authTypes = this.reflector.getAllAndOverride<AuthTypeEnum[]>(
            MetadataKeyEnum.AUTH_TYPES,
            [context.getHandler(), context.getClass()],
        );

        if (!authTypes || authTypes.length === 0) {
            return true;
        }

        const authAttempts: Record<string, Error> = {};
        for (const authType of authTypes) {
            try {
                switch (authType) {
                    case AuthTypeEnum.BEARER:
                        if (await this.bearerGuard.canActivate(context)) {
                            return true;
                        }
                        break;
                    case AuthTypeEnum.COOKIE:
                        if (await this.cookieGuard.canActivate(context)) {
                            return true;
                        }
                        break;
                    case AuthTypeEnum.NONE:
                        return true;
                }
            } catch (error) {
                if (typeof error === `object` && error instanceof Error) {
                    authAttempts[authType] = error;
                } else {
                    authAttempts[authType] = new Error(
                        `Unknown error during authentication.`,
                    );
                }
            }
        }

        Object.entries(authAttempts).map(([authType, error]) => {
            this.logger.warn(`${authType} Authentication fail: ${error?.message}`, {
                startTime,
                tag: LogTypeEnum.AUTHORIZATION_FAIL,
            });
        });

        throw new UnauthorizedException(`Invalid authentication credentials.`);
    }
}

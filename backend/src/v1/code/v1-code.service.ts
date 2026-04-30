import { CodeEntity } from "@libs/entities/entities/code.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { EmailerService } from "@libs/emailer";
import { UserEntity } from "@libs/entities";
import { Repository } from "typeorm";
import { ActiveUserPayload } from "@libs/types";
import { EmailerEventsEnum } from "@libs/enums";
import { render, pretty } from "@react-email/components";
import { randomInt } from "crypto";
@Injectable()
export class V1CodeService {

    constructor(
        @InjectRepository(CodeEntity)
        private readonly codeRepository: Repository<CodeEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectLogger(V1CodeService)
        private readonly logger: Logger,
        private readonly emailerService: EmailerService
    ) { }

    private randomNumber(length: number = 9): string {
        const maxValue = 10 ** length;
        return randomInt(0, maxValue).toString().padStart(length, "0");
    };

    public async sendVerificationCodeToEmail(
        { id }: ActiveUserPayload, email?: string,
    ): Promise<void> {

        if (!email) {

            const user = await this.userRepository.findOne({
                where: { id },
                select: { email: true }
            });

            if (!user) {
                this.logger.error(`User with id ${id} not found.`);
                return;
            }

            email = user.email;
        }

        const code = this.randomNumber();
        const expiryTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const link = `${process.env.ORIGIN}/v1/code/${code}/confirm`;

        const subject = `Your Verification Code`;
        await this.emailerService.send({
            subject,
            to: email,
            data: { code, email, expiryTime, link },
            event: EmailerEventsEnum.REGISTRATION_CODE,
        });

    }

}

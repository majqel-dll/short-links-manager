import { CodeEntity } from "@libs/entities/entities/code.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InjectLogger } from "@libs/decorators";
import { EmailerService } from "@libs/emailer";
import { UserEntity } from "@libs/entities";
import { Repository } from "typeorm";
import { ActiveUserPayload } from "@libs/types";
import { EmailerEventsEnum } from "@libs/enums";

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

    public async sendVerificationCodeToEmail(
        event: EmailerEventsEnum, { id }: ActiveUserPayload, email?: string,
    ): Promise<void> {

        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            this.logger.error(`User with id ${id} not found.`);
            return;
        }

        const subject = `Your Verification Code`;
        await this.emailerService.send();

    }

}

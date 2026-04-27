import { createTransport, SendMailOptions } from 'nodemailer'
import { EmailerEventsEnum, LogTypeEnum } from '@libs/enums';
import { MailerDataMap, type MailerConfig } from '@libs/types';
import { InjectLogger } from '@libs/decorators';
import { Injectable } from '@nestjs/common';
import { Logger } from '@libs/logger';
@Injectable()
export class EmailerService {

    constructor(
        @InjectLogger(EmailerService) private readonly logger: Logger,
    ) { }

    private pickTemplate<T extends EmailerEventsEnum, U>(
        event: T, data?: MailerDataMap[T]
    ): [string, string] {

        let html: string = ``;
        let text: string = ``;

        return [html, text];
    }

    public isEmailValid = (email: string): boolean => {
        const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        return pattern.test(email);
    }

    public randomNumber = (min: number, max: number): Number => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public async send<T extends EmailerEventsEnum, U extends MailerDataMap[T]>(
        { to, data, subject, cc, bcc, event }: MailerConfig<T, U>
    ): Promise<void> {

        const startTime: number = Date.now();
        if (!to) {
            throw new Error(`The "to" value is required but received "${to}".`);
        }

        if (!subject) {
            throw new Error(`The "subject" value is required but received "${subject}"`);
        }

        try {

            if (process.env.NODE_ENV === `DEVELOPMENT`) {
                const triggerEvent = event ? ` from event: "${event}" about` : ``;
                this.logger.warn(`The email${triggerEvent} "${subject}" to "${to}" was not sent. Function unavailable in development mode.`,
                    { startTime, tag: LogTypeEnum.EMAIL }
                )
                return
            }

            const transport = createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT),
                secure: false,
                connectionTimeout: 1e4,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: { rejectUnauthorized: false }
            })

            const [html, text] = this.pickTemplate(event, data);
            const options: SendMailOptions = {
                to: Array.isArray(to) ? to : [to].filter(Boolean).join(`,`),
                text,
                html,
                subject,
                from: process.env.SMTP_FROM_EMAIL,
            }

            bcc = Array.isArray(bcc) ? bcc : [bcc].filter(Boolean);
            cc = Array.isArray(cc) ? cc : [cc].filter(Boolean);

            if (html) options.html = html;
            if (bcc.length > 0) options.bcc = bcc.join(`,`);
            if (cc.length > 0) options.cc = cc.join(`,`);

            await transport.sendMail(options);
            const triggerEvent = event ? ` from event: "${event}"` : ``;
            this.logger.log(`Email notification${triggerEvent} has been sent successfully.`,
                { startTime, tag: LogTypeEnum.EMAIL });

        } catch (error) {

            const triggerEvent = event ? ` from event: "${event}"` : ``;
            this.logger.error(`Failed to send notification email${triggerEvent}.`,
                { error: error as Error, startTime, tag: LogTypeEnum.EMAIL_FAILED })

        }
    }

}

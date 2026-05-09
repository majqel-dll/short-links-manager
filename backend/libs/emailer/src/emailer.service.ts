import { MailerDataMap, RegistrationCodeEmailData, type MailerConfig } from "@libs/types";
import { CodeActionEnum, LogTypeEnum } from "@libs/enums";
import { RegistrationCodeTemplate } from "@libs/email-templates";
import { render, toPlainText } from "@react-email/components";
import { createTransport, SendMailOptions } from "nodemailer";
import { InjectLogger } from "@libs/decorators";
import { Injectable } from "@nestjs/common";
import { Logger } from "@libs/logger";

@Injectable()
export class EmailerService {
    constructor(@InjectLogger(EmailerService) private readonly logger: Logger) {}

    private async pickTemplate<T extends CodeActionEnum, U extends MailerDataMap[T]>(
        event: T,
        data?: U,
    ): Promise<[string, string]> {
        let html: string = null;
        let text: string = null;

        switch (event) {
            case CodeActionEnum.VERIFY_EMAIL:
                html = await render(
                    RegistrationCodeTemplate(data as RegistrationCodeEmailData),
                    { pretty: true },
                );
                text = toPlainText(html);
                break;
            case CodeActionEnum.DELETE_ACCOUNT_CONFIRM:
                html = await render(
                    RegistrationCodeTemplate(data as RegistrationCodeEmailData),
                    { pretty: true },
                );
                text = toPlainText(html);
                break;
            case CodeActionEnum.RESET_PASSWORD_REQUEST:
                html = await render(
                    RegistrationCodeTemplate(data as RegistrationCodeEmailData),
                    { pretty: true },
                );
                text = toPlainText(html);
                break;
            default:
                throw new Error(
                    `No template found for event: "${event}". Please provide html or text content directly.`,
                );
        }

        return [html, text];
    }

    public isEmailValid(email: string): boolean {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
    }

    public async send<T extends CodeActionEnum, U extends MailerDataMap[T]>({
        to,
        data,
        subject,
        cc,
        bcc,
        event,
        text,
        html,
    }: MailerConfig<T, U>): Promise<void> {
        const startTime: number = Date.now();
        if (to === undefined || to === null) {
            throw new Error(`The "to" value is required but received an empty value.`);
        }

        if (subject === undefined || subject === null) {
            throw new Error(`The "subject" value is required but received "${subject}"`);
        }

        try {
            if (
                process.env.SMTP_HOST === undefined ||
                process.env.SMTP_USER === undefined
            ) {
                const triggerEvent = event ? ` from event: "${event}" about` : ``;
                const recipients = Array.isArray(to) ? to.join(",") : to;
                this.logger.warn(
                    `The email${triggerEvent} "${subject}" to "${recipients}" was not sent. Mailing server is unspecified in development.`,
                    { startTime, tag: LogTypeEnum.EMAIL },
                );
                return;
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
                tls: { rejectUnauthorized: false },
            });

            if (!text && !html) {
                [html, text] = await this.pickTemplate(event, data);
            }

            const options: SendMailOptions = {
                to: Array.isArray(to) ? to : [to].filter(Boolean).join(`,`),
                text,
                html,
                subject,
                from: process.env.SMTP_FROM_EMAIL,
            };

            bcc = Array.isArray(bcc) ? bcc : [bcc].filter(Boolean);
            cc = Array.isArray(cc) ? cc : [cc].filter(Boolean);

            if (html) {
                options.html = html;
            }
            if (text) {
                options.text = text;
            }
            if (bcc.length > 0) {
                options.bcc = bcc.join(`,`);
            }
            if (cc.length > 0) {
                options.cc = cc.join(`,`);
            }

            await transport.sendMail(options);
            const triggerEvent = event ? ` from event: "${event}"` : ``;
            this.logger.log(
                `Email notification${triggerEvent} has been sent successfully.`,
                { startTime, tag: LogTypeEnum.EMAIL },
            );
        } catch (error) {
            const triggerEvent = event ? ` from event: "${event}"` : ``;
            this.logger.error(`Failed to send notification email${triggerEvent}.`, {
                error: error as Error,
                startTime,
                tag: LogTypeEnum.EMAIL_FAILED,
            });
        }
    }
}

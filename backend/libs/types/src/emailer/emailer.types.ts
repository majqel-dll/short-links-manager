import { EmailerEventsEnum } from "@libs/enums";

export type AccountDeletionEmailData = {}
export type PasswordResetEmailData = {}
export type RegistrationCodeEmailData = {}

export type MailerDataMap = {
    [EmailerEventsEnum.REGISTRATION_CODE]: RegistrationCodeEmailData,
    [EmailerEventsEnum.ACCOUNT_DELETION]: AccountDeletionEmailData,
    [EmailerEventsEnum.PASSWORD_RESET]: PasswordResetEmailData,
}

export type MailerConfig<T extends any, U extends EmailerEventsEnum> = {
    to: string | string[],
    data?: T,
    html: string,
    subject: string,
    cc?: string | string[],
    bcc?: string | string[],
    event: U,
}
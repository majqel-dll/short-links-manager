import { EmailerEventsEnum } from "@libs/enums";

export type AccountDeletionEmailData = {}
export type PasswordResetEmailData = {}
export type RegistrationCodeEmailData = {}

export type MailerDataMap = {
    [EmailerEventsEnum.REGISTRATION_CODE]: RegistrationCodeEmailData,
    [EmailerEventsEnum.ACCOUNT_DELETION]: AccountDeletionEmailData,
    [EmailerEventsEnum.PASSWORD_RESET]: PasswordResetEmailData,
}

export type MailerConfig<T extends EmailerEventsEnum, U extends MailerDataMap[T]> = {
    to: string | string[],
    data?: U,
    html: string,
    subject: string,
    cc?: string | string[],
    bcc?: string | string[],
    event: T,
}
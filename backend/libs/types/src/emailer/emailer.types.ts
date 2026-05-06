import { type EmailerEventsEnum } from "@libs/enums";

export type AccountDeletionRequestEmailData = {
    code: string;
    email: string;
    expiryTime: string;
    link: string;
};
export type PasswordResetRequestEmailData = {
    code: string;
    email: string;
    expiryTime: string;
    link: string;
};
export type PasswordResetConfirmEmailData = {
    code: string;
    email: string;
    expiryTime: string;
    link: string;
};
export type RegistrationCodeEmailData = {
    code: string;
    email: string;
    expiryTime: string;
    link: string;
};

export type MailerDataMap = {
    [EmailerEventsEnum.REGISTRATION_CODE]: RegistrationCodeEmailData;
    [EmailerEventsEnum.ACCOUNT_DELETION]: AccountDeletionRequestEmailData;
    [EmailerEventsEnum.PASSWORD_RESET_REQUEST]: PasswordResetRequestEmailData;
    [EmailerEventsEnum.PASSWORD_RESET_CONFIRM]: PasswordResetConfirmEmailData;
};

export type MailerConfig<T extends EmailerEventsEnum, U extends MailerDataMap[T]> = {
    to: string | string[];
    data?: U;
    html?: string;
    text?: string;
    subject: string;
    cc?: string | string[];
    bcc?: string | string[];
    event: T;
};

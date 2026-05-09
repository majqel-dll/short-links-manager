import { type CodeActionEnum } from "@libs/enums";

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
export type RegistrationCodeEmailData = {
    code: string;
    email: string;
    expiryTime: string;
    link: string;
};

export type MailerDataMap = {
    [CodeActionEnum.VERIFY_EMAIL]: RegistrationCodeEmailData;
    [CodeActionEnum.DELETE_ACCOUNT_CONFIRM]: AccountDeletionRequestEmailData;
    [CodeActionEnum.RESET_PASSWORD_REQUEST]: PasswordResetRequestEmailData;
};

export type MailerConfig<T extends CodeActionEnum, U extends MailerDataMap[T]> = {
    to: string | string[];
    data?: U;
    html?: string;
    text?: string;
    subject: string;
    cc?: string | string[];
    bcc?: string | string[];
    event: T;
};

import { type EmailStatusEnum } from "@libs/enums";
import { type ReactNode } from "react";

export type EmailLayoutProps = {
    children: ReactNode;
    status: EmailStatusEnum;
    title: string;
    header?: EmailHeaderProps;
    footer?: EmailFooterProps;
};

export type EmailHeaderProps = {
    text: string;
    description?: string;
    status: EmailStatusEnum;
    withSeparator?: boolean;
};

export type EmailFooterProps = {
    text: string;
    description?: string;
    withSeparator?: boolean;
};

export type EmailConfigProps = {
    title: string;
};

export type EmailBodyProps = {
    children: ReactNode;
    status: EmailStatusEnum;
    header?: EmailHeaderProps;
    footer?: EmailFooterProps;
};

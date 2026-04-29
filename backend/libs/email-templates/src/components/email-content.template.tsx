import { Section } from "@react-email/components";
import React,{ JSX, ReactNode } from "react";

export function EmailContentComponent(
    { children }: { children: ReactNode }
): JSX.Element {
    const sectionStyle = `bg-white p-2 shadow-soft-light overflow-hidden rounded-md my-3 text-sm`;
    return (<Section className={sectionStyle}>{children}</Section>);
}
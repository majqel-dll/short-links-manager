import { Body, Container, Section } from "@react-email/components";
import { EmailHeader, EmailFooter } from "./index";
import { EmailBodyProps } from "@libs/types";
import React, { JSX } from "react";

export function EmailBody(
    { children, footer, header }: EmailBodyProps
): JSX.Element {
    const bodyStyle = `bg-gray-100`;
    const sectionStyle = `
    font-sans text-center max-[850px]:p-5
    max-[650px]:p-4 max-[650px]:text-base
    max-[475px]:p-3 max-[475px]:text-sm
    max-[400px]:p-2 max-[350px]:p-1 max-[350px]:text-xs
    `;
    const containerStyle = `mx-auto max-w-[850px] rounded-md`;

    return (<Body className={bodyStyle}>
        <Section className={sectionStyle}>
            <Container className={containerStyle}>
                {header && <EmailHeader {...header} />}
                {children}
                {footer && <EmailFooter {...footer} />}
            </Container>
        </Section>
    </Body>)
}

export default EmailBody;
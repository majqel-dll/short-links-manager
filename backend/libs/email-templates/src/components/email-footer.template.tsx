import { Hr, Section, Text } from "@react-email/components";
import { EmailFooterProps } from "@libs/types";
import React, { JSX } from "react";

export function EmailFooter(
    { text, description, withSeparator }: EmailFooterProps
): JSX.Element {

    const sectionStyle = `bg-white p-3 shadow-soft-light overflow-hidden rounded-md`;
    const textStyle = `text-black font-bold text-center`;
    const descriptionStyle = `text-[#111111] text-center`;

    return (<>
        {withSeparator && <Hr />}
        <Section className={sectionStyle}>
            {text && <Text className={textStyle}>{text}</Text>}
            {description && <Text className={descriptionStyle}>{description}</Text>}
        </Section>
    </>)
}

export default EmailFooter;
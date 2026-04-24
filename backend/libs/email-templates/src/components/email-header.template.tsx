import { Hr, Section, Text } from "@react-email/components";
import { getStyleForStatus } from "@libs/utils";
import { EmailHeaderProps } from "@libs/types";
import { EmailPartEnum } from "@libs/enums";
import React, { JSX } from "react";

export function EmailHeader(
    { text, description, status, withSeparator }: EmailHeaderProps
): JSX.Element {

    const wraperStyle = `bg-white shadow-soft-light rounded-md p3 border-solid border-t-[10px] ${getStyleForStatus(status, EmailPartEnum.BORDER)}`;
    const textStyle = `text-black font-bold text-center ${description && "mb-1"}`;
    const descriptionStyle = `text-[#121212] text-center`;

    return (<>
        <Section className={wraperStyle}>
            {text && <Text className={textStyle}>{text}</Text>}
            {description && <Text className={descriptionStyle}>{description}</Text>}
        </Section>
        {withSeparator && <Hr className="my-3" />}
    </>)
}

export default EmailHeader;
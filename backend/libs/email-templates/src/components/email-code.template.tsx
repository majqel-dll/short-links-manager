import { Section, Text } from "@react-email/components";
import React, { JSX } from "react";

export function EmailCode({ code }: { code: string }): JSX.Element {

    const wraperStyle = `rounded-md p-2`;
    const textStyle = `text-black font-bold text-center`;
    const className = `${wraperStyle} ${textStyle}`;

    return <Section className={className}>
        <Text className="bg-mainbg p-5 text-2xl tracking-[10px] rounded-lg">{code}</Text>
    </Section>;
}

export default EmailCode;
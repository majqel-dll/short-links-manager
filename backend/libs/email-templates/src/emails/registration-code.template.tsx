import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { EmailLayoutProps, RegistrationCodeEmailData } from "@libs/types";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function RegistrationCodeTemplate(
    { code, email, expiryTime, link }: RegistrationCodeEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">Below you'll find the activation code for your account.</div>
            <div className="text-center p-3">Code expires: <span className="font-bold">{expiryTime
                ? new Date(expiryTime).toLocaleString(`en-US`)
                : `$expiryTime`}</span></div>
        </EmailContentComponent>

        <EmailContentComponent>
            <EmailCode code={code ?? `$your-code`} />
        </EmailContentComponent>

    </>

    const props: EmailLayoutProps = {
        title: `Verification code for ${email}`,
        status: EmailStatusEnum.SUCCESS,
        header: {
            status: EmailStatusEnum.SUCCESS,
            text: `Your verification code`,
            withSeparator: true,
        },
        footer: {
            text: ``,
            description: `If you didn't request this code, you can safely ignore it.`,
            withSeparator: true,
        },
        children: content,
    }

    return (<EmailLayout {...props} />);
}

export default RegistrationCodeTemplate;
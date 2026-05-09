import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { EmailLayoutProps, RegistrationCodeEmailData } from "@libs/types";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function PasswordResetRequestTemplate(
    { code, email, expiryTime }: RegistrationCodeEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">Below you'll find your password reset code.</div>
            <div className="text-center p-3">Code expires: <span className="font-bold">{expiryTime
                ? new Date(expiryTime).toLocaleString(`en-US`)
                : `$expiryTime`}</span></div>
        </EmailContentComponent>

        <EmailContentComponent>
            <EmailCode code={code ?? `$your-code`} />
        </EmailContentComponent>

    </>

    const props: EmailLayoutProps = {
        title: `Password reset code for ${email}`,
        status: EmailStatusEnum.SUCCESS,
        header: {
            status: EmailStatusEnum.SUCCESS,
            text: `Your password reset code`,
            withSeparator: true,
        },
        footer: {
            text: `Stay secure!`,
            description: `If you didn't request this code, you can safely ignore it.`,
            withSeparator: true,
        },
        children: content,
    }

    return (<EmailLayout {...props} />);
}

export default PasswordResetRequestTemplate;
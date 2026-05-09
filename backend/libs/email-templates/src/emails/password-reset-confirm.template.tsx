import { EmailContentComponent, EmailLayout } from "../components";
import { EmailLayoutProps, RegistrationCodeEmailData } from "@libs/types";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";
import { Button } from "@react-email/components";

export function PasswordResetConfirmTemplate(
    { email, expiryTime, link }: RegistrationCodeEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">We received a request to reset the password for your account.</div>
            <div className="text-center p-3">Reset link valid until: <span className="font-bold">{expiryTime
                ? new Date(expiryTime).toLocaleString(`en-US`)
                : `$expiryTime`}</span></div>
        </EmailContentComponent>

        <EmailContentComponent>
            <div className="text-center pt-3">Click the button below to open the password reset page and set a new password:</div>
            <div className="text-center my-4">
                <Button href={link} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg no-underline">
                    Reset my password
                </Button>
            </div>
        </EmailContentComponent>
    </>

    const props: EmailLayoutProps = {
        title: `Password reset request for ${email}`,
        status: EmailStatusEnum.SUCCESS,
        header: {
            status: EmailStatusEnum.SUCCESS,
            text: `Reset your password`,
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

export default PasswordResetConfirmTemplate;
import { AccountDeletionRequestEmailData, EmailLayoutProps } from "@libs/types";
import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { Button } from "@react-email/components";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function AccountDeletionConfirmTemplate(
    { code, email, expiryTime, link }: AccountDeletionRequestEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">
                Below you'll find the confirmation code for deleting your account {email}.
            </div>
            <div className="text-center pt-3">
                This action is irreversible and will result in the permanent loss of all your data.
            </div>
            <div className="text-center p-3">
                Code valid until: <span className="font-bold">{expiryTime
                    ? new Date(expiryTime).toLocaleString(`en-US`)
                    : `$expiryTime`}</span>
            </div>

        </EmailContentComponent>

        <EmailContentComponent>
            <EmailCode code={code ?? `$your-code`} />
        </EmailContentComponent>

        <EmailContentComponent>
            <div className="text-center pt-3">You can also click the button below to confirm the account deletion:</div>
            <div className="text-center my-4">
                <Button href={link} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg no-underline">
                    I confirm account deletion
                </Button>
            </div>
        </EmailContentComponent>

    </>

    const props: EmailLayoutProps = {
        title: `Account deletion confirmation for ${email}`,
        status: EmailStatusEnum.ERROR,
        header: {
            status: EmailStatusEnum.ERROR,
            text: `Your account deletion confirmation code`,
            withSeparator: true,
        },
        footer: {
            text: `Thank you for using our service!`,
            description: `If you didn't request this code, you should change your account password as soon as possible or contact the administrator.`,
            withSeparator: true,
        },
        children: content,
    }

    return (<EmailLayout {...props} />);
}

export default AccountDeletionConfirmTemplate;
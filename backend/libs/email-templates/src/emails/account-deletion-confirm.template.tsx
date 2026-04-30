import { AccountDeletionRequestEmailData, EmailLayoutProps } from "@libs/types";
import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function AccountDeletionConfirmTemplate(
    { code, email, expiryTime, link }: AccountDeletionRequestEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">
                Poniżej znajdziesz kod potwierdzający usunięcie Twojego konta {email}.
            </div>
            <div className="text-center pt-3">
                To działanie jest nieodwracalne i spowoduje bezpowrotną utratę wszystkich danych.
            </div>
            <div className="text-center p-3">
                Kod będzie ważny do: <span className="font-bold">{expiryTime
                    ? new Date(expiryTime).toLocaleString(`pl-PL`)
                    : `$expiryTime`}</span>
            </div>

        </EmailContentComponent>

        <EmailContentComponent>
            <EmailCode code={code ?? `$your-code`} />
        </EmailContentComponent>

        <EmailContentComponent>
            <div className="text-center pt-3">Możesz również kliknąć w poniższy link, aby potwierdzić usunięcie konta:</div>
            <div className="text-center pt-3"><a href={link} className="text-blue-500">Potwierdzam usunięcie konta.</a></div>
        </EmailContentComponent>

    </>

    const props: EmailLayoutProps = {
        title: `Kod weryfikacyjny dla ${email}`,
        status: EmailStatusEnum.ERROR,
        header: {
            status: EmailStatusEnum.SUCCESS,
            text: `Twój kod zatwierdzający usunięcie konta`,
            withSeparator: true,
        },
        footer: {
            text: `Dziękujemy za korzystanie z naszego serwisu!`,
            description: `Jeśli nie prosiłeś o ten kod, powinieneś jak najszybciej zmienić hasło do swojego konta lub skontaktować się z administratorem.`,
            withSeparator: true,
        },
        children: content,
    }

    return (<EmailLayout {...props} />);
}

export default AccountDeletionConfirmTemplate;
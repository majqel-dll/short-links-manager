import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { EmailLayoutProps } from "@libs/types";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function RegistrationCodeTemplate(
    { code, email, expiryTime }: any
): JSX.Element {

    const content = <EmailContentComponent>
        <div>Poniżej znajdziesz kod aktywacyjny do Twojego konta.</div>

        <EmailCode code={code} />
        <ul>
            <li className="list-none text-left" >Wygaśnięcie kodu: {expiryTime ?? `'$expiryTime'`}</li>
        </ul>
    </EmailContentComponent>

    const props: EmailLayoutProps = {
        title: `Kod weryfikacyjny dla ${email}`,
        status: EmailStatusEnum.SUCCESS,
        header: {
            status: EmailStatusEnum.SUCCESS,
            text: `Twój kod weryfikacyjny`,
            withSeparator: true,
        },
        footer: {
            text: `Dziękujemy za rejestrację!`,
            description: `Jeśli nie prosiłeś o ten kod, możesz bezpiecznie go zignorować.`,
            withSeparator: true,
        },
        children: content,
    }

    return (<EmailLayout {...props} />);
}

export default RegistrationCodeTemplate;
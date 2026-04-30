import { EmailCode, EmailContentComponent, EmailLayout } from "../components";
import { EmailLayoutProps, RegistrationCodeEmailData } from "@libs/types";
import { EmailStatusEnum } from "@libs/enums";
import React, { JSX } from "react";

export function PasswordResetConfirmTemplate(
    { code, email, expiryTime }: RegistrationCodeEmailData
): JSX.Element {

    const content = <>
        <EmailContentComponent>
            <div className="text-center pt-3">Poniżej znajdziesz kod aktywacyjny do Twojego konta.</div>
            <div className="text-center p-3">Wygaśnięcie kodu: <span className="font-bold">{expiryTime
                ? new Date(expiryTime).toLocaleString(`pl-PL`)
                : `$expiryTime`}</span></div>
        </EmailContentComponent>

        <EmailContentComponent>
            <EmailCode code={code ?? `$your-code`} />
        </EmailContentComponent>

    </>

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

export default PasswordResetConfirmTemplate;
import { Html, Tailwind } from "@react-email/components";
import { EmailConfig, EmailBody } from "./index";
import { EmailLayoutProps } from "@libs/types";
import React, { JSX } from "react";

export function EmailLayout(
    { children, status, header, footer, title }: EmailLayoutProps
): JSX.Element {

    return (<Html lang="pl" dir="ltr">
        <Tailwind config={{
            theme: {
                extend: {
                    fontFamily: {
                        sans: [`montserrat`, `sans-serif`]
                    },
                    boxShadow: {
                        "soft-light": "0 0 15px rgba(0, 0, 0, 0.17)",
                    },
                }
            }
        }}>
            <EmailConfig title={title} />
            <EmailBody
                children={children}
                status={status}
                header={header}
                footer={footer}
            />
        </Tailwind>
    </Html >);

}

export default EmailLayout;
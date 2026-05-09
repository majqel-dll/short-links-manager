import { EmailConfigProps } from "@libs/types";
import { Head } from "@react-email/components";
import React, { JSX } from "react";

export function EmailConfig({ title }: EmailConfigProps): JSX.Element {
    return (<Head>
        <style>{
            "@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap')"
        }</style>
        <title>{title}</title>
    </Head>)
}

export default EmailConfig;
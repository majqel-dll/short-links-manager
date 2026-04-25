import React, { JSX } from "react";

export function EmailCode({ code }: { code: string }): JSX.Element {
    return <div>{code}</div>;
}

export default EmailCode;
import { EmailPartEnum, EmailStatusEnum } from "@libs/enums";

export function getStyleForStatus(status: EmailStatusEnum, part: EmailPartEnum): string {
    if (part === EmailPartEnum.BACKGROUND) {
        switch (status) {
            case EmailStatusEnum.SUCCESS:
                return `color-green-500`;
            case EmailStatusEnum.WARNING:
                return `color-orange-500`;
            case EmailStatusEnum.ERROR:
                return `color-red-600`;
            default:
                return `color-neutral-900`;
        }
    } else if (part === EmailPartEnum.TEXT) {
        switch (status) {
            case EmailStatusEnum.SUCCESS:
                return `bg-green-500`;
            case EmailStatusEnum.WARNING:
                return `bg-orange-500`;
            case EmailStatusEnum.ERROR:
                return `bg-red-600`;
            default:
                return `bg-neutral-900`;
        }
    } else if (part === EmailPartEnum.BORDER) {
        switch (status) {
            case EmailStatusEnum.SUCCESS:
                return `border-green-500`;
            case EmailStatusEnum.WARNING:
                return `border-orange-500`;
            case EmailStatusEnum.ERROR:
                return `border-red-600`;
            default:
                return `border-neutral-900`;
        }
    }
    return ``;
}

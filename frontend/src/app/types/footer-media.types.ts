export type FooterSection = {
    label: string,
    properties: MediaProperty[];
}
export type MediaProperty = InnerMediaProperty | OuterMediaProperty;

export type InnerMediaProperty = MediaPropertyBase & {
    routerLink: string,
}

export type OuterMediaProperty = MediaPropertyBase & {
    href: string,
}

type MediaPropertyBase = {
    class?: string,
    label: string,
}
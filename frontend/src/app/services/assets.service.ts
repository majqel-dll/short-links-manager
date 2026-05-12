import { FooterSection } from "@models/footer-media.types";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: `root` })
export class AppAssetsService {

    public appName: string = `Short-links Manager`;
    public year: string = new Date().getFullYear().toString();
    public footerContent: FooterSection[] = [
        {
            label: "Projects",
            properties: [
                { label: `Short-links Manager`, href: atob('aHR0cHM6Ly9naXRodWIuY29tL21hanFlbC1kbGwvc2hvcnQtbGlua3MtbWFuYWdlcg==') },
                { label: `CEPIK API Client`, href: atob('aHR0cHM6Ly9naXRodWIuY29tL21hanFlbC1kbGwvY2VwaWstY2xpZW50') },
                { label: `NBP API Client`, href: atob('aHR0cHM6Ly9naXRodWIuY29tL21hanFlbC1kbGwvbmJwLWFwaS1jbGllbnQ=') },
            ]
        },
        {
            label: "My media",
            properties: [
                { label: `Discord`, href: atob('aHR0cHM6Ly9kaXNjb3JkLmdnLzVlZ3dKUEJNNXQ=') },
                { label: `GitHub`, href: atob('aHR0cHM6Ly9naXRodWIuY29tL21hanFlbC1kbGw=') },
                { label: `YouTube`, href: atob('aHR0cHM6Ly93d3cueW91dHViZS5jb20vQG1idWdhanNreQ==') },
                { label: `Instagram`, href: atob('aHR0cHM6Ly93d3cuaW5zdGFncmFtLmNvbS9tYnVnYWpza3kv') },
            ]
        },
        {
            label: "Personalities",
            properties: [
                { label: `Portfolio`, href: atob('aHR0cHM6Ly9wb3J0Zm9saW8ubWJ1Z2Fqc2tpLnBsLw==') },
                { label: `Contact`, href: atob('aHR0cHM6Ly9tYnVnYWpza2kucGwva29udGFrdA==') },
                { label: `About me`, href: atob('aHR0cHM6Ly9tYnVnYWpza2kucGwvby1tbmll') },
            ]
        },
    ]
};
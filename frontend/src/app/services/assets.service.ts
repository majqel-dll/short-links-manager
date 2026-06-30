import { FooterSection, PageRoute } from "@models/layout.types";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: `root` })
export class AppAssetsService {

    public appName: string = `Short-links Manager`;
    public year: string = new Date().getFullYear().toString();
    public authorGithubProfileUrl: string = atob('aHR0cHM6Ly9naXRodWIuY29tL21hanFlbC1kbGw=');

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
                { label: `GitHub`, href: this.authorGithubProfileUrl },
                { label: `Discord`, href: atob('aHR0cHM6Ly9kaXNjb3JkLmdnLzVlZ3dKUEJNNXQ=') },
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
    ];

    private routes: PageRoute[] = [
        { title: "Redirections", route: 'redirections' },
        { title: 'Users', route: 'users' },
        { title: 'Logs', route: 'logs' },
        { title: 'profile', route: 'profile' },
    ]

    public addRoute(route: PageRoute): void {
        this.routes.push(route);
    }

    public getRoutes(count?: number): PageRoute[] {
        if (count) return this.routes.filter((_, i) => i < count);
        return this.routes;
    }

};
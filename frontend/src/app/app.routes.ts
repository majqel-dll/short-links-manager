import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { PanelPage } from './pages/panel-page/panel-page';
import { loggedInGuard, authGuard } from './guards';
import { SignUpPage } from '@pages/sign-up-page';
import { SignInPage } from '@pages/sign-in-page';
import { Homepage } from '@pages/home-page';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: ``,
        component: PanelPage,
        pathMatch: `full`,
        canMatch: [loggedInGuard],
        children: [
            {
                path: 'redirection',
                canActivateChild: [authGuard],
                component: SignInPage,
            }
        ]
    },
    { path: ``, pathMatch: `full`, component: Homepage },
    { path: `sign-in`, component: SignInPage },
    { path: `sign-up`, component: SignUpPage },
    { path: `redirection/not-found`, component: NotFoundPage },
    { path: `**`, redirectTo: `redirection/not-found` },
];

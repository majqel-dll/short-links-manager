import { loggedInGuard, authGuard, signInOrUpGuard, canDeactivateGuard } from './guards';
import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { ProfilePage } from '@pages/profile-page/profile-page';
import { PanelPage } from './pages/panel-page/panel-page';
import { SignUpPage } from '@pages/sign-up-page';
import { SignInPage } from '@pages/sign-in-page';
import { Homepage } from '@pages/home-page';
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: ``,
        component: PanelPage,
        canMatch: [loggedInGuard],
        children: [
            {
                path: `redirections`,
                component: SignInPage,
                canActivate: [authGuard],
                canDeactivate: [canDeactivateGuard]
            },
            {
                path: 'profile',
                component: ProfilePage,
                canActivate: [authGuard],
                canDeactivate: [canDeactivateGuard]
            },
            {
                path: `users`,
                component: SignInPage,
                canActivate: [authGuard],
                canDeactivate: [canDeactivateGuard]
            },
            {
                path: `logs`,
                component: SignInPage,
                canActivate: [authGuard],
                canDeactivate: [canDeactivateGuard]
            },
        ]
    },
    {
        path: ``,
        pathMatch: `full`,
        component: Homepage
    },
    {
        path: `sign-in`,
        component: SignInPage,
        canActivate: [signInOrUpGuard]
    },
    {
        path: `sign-up`,
        component: SignUpPage,
        canActivate: [signInOrUpGuard],
        canDeactivate: [canDeactivateGuard]
    },
    {
        path: `redirection/not-found`,
        component: NotFoundPage
    },
    {
        path: `**`,
        redirectTo: `redirection/not-found`
    },
];

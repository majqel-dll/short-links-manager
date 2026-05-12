import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { SettingsPage } from '@pages/settings-page/settings-page';
import { ProfilePage } from '@pages/profile-page/profile-page';
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
    },
    { path: ``, pathMatch: `full`, component: Homepage },
    { path: 'redirection', component: SignInPage, canActivate: [authGuard] },
    { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
    { path: 'settings', component: SettingsPage, canActivate: [authGuard] },
    { path: `sign-in`, component: SignInPage },
    { path: `sign-up`, component: SignUpPage },
    { path: `redirection/not-found`, component: NotFoundPage },
    { path: `**`, redirectTo: `redirection/not-found` },
];

import { NotFoundPage } from './pages/not-found-page/not-found-page';
import { SignInPage } from './pages/sign-in-page/sign-in-page';
import { PanelPage } from './pages/panel-page/panel-page';
import { authGuard } from '@services/auth-guard.service';
import { Homepage } from '@pages/home-page';
import { Routes } from '@angular/router';
import { App } from './pages/app/app';

export const routes: Routes = [
    { path: ``, pathMatch: `full`, component: Homepage },
    { path: `panel`, component: PanelPage, canActivate: [authGuard] },
    { path: `**`, component: App }
];

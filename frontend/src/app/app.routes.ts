import { Routes } from '@angular/router';
import { App } from './pages/app/app';

export const routes: Routes = [
    { path: ``, pathMatch: `full`, component: App },
    { path: `**`, component: App }
];

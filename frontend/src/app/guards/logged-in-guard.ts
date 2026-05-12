import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const loggedInGuard: CanMatchFn = () => {
    const authService = inject(AuthService);
    return authService.isSignedIn;
};
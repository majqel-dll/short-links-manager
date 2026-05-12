import {
    ActivatedRouteSnapshot, CanActivateFn, GuardResult,
    MaybeAsync, Router, RouterStateSnapshot
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const isSignedIn = authService.isSignedIn.getValue();
    if (!isSignedIn) {
        router.navigate([`management`,`signin`])
        return false;
    };

    return true;
};
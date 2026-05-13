import {
    ActivatedRouteSnapshot, CanActivateFn, GuardResult,
    MaybeAsync, Router, RouterStateSnapshot
} from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { ViewportScroller } from "@angular/common";

export const signInOrUpGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): MaybeAsync<GuardResult> => {

    const authService = inject(AuthService);
    const router = inject(Router);
    const viewportScroller = inject(ViewportScroller);

    const isSignedIn = authService.isSignedIn.getValue();
    if (isSignedIn) {
        router.navigate([`/`]);
        viewportScroller.scrollToPosition([0, 0], { behavior: 'smooth' });
        return false;
    };

    return true;
};
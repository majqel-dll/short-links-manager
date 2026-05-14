import {
    ActivatedRouteSnapshot, CanDeactivateFn, GuardResult,
    MaybeAsync, RouterStateSnapshot
} from "@angular/router";
import { CanComponentDeactivate } from "@models/guards.types";

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
): MaybeAsync<GuardResult> => {
    return component.canDeactivate ? component.canDeactivate() : true;
}
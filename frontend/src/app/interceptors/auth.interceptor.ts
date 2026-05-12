import { Observable, Subject, from, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { AuthService } from '@services/auth.service';
import { inject, Injectable } from '@angular/core';
import {
    HTTP_INTERCEPTORS,
    HttpErrorResponse,
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
} from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private authService = inject(AuthService);
    private refreshTokenSubject: Subject<boolean> = new Subject<boolean>();
    private isRefreshing = false;

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let requestWithCookies = request.clone({ withCredentials: true });
        return next.handle(requestWithCookies).pipe(catchError((error: HttpErrorResponse) => {
            const isAuthEndpoint =
                request.url.includes(`/v1/auth/token/refresh`) ||
                request.url.includes(`/v1/auth/sign-in`) ||
                request.url.includes(`/v1/auth/sign-out`);

            if (error.status === 401 && !isAuthEndpoint) {
                return this.handle401Error(requestWithCookies, next);
            }

            return throwError(() => error);
        }));
    };

    private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

        if (this.isRefreshing) {
            return this.refreshTokenSubject.pipe(
                take(1),
                switchMap((isRefreshed) => {

                    if (!isRefreshed) {
                        return throwError(() => new Error('Token refresh failed'));
                    }

                    return next.handle(request);
                })
            );
        }

        this.isRefreshing = true;
        return from(this.authService.refreshToken()).pipe(
            switchMap((isTokenRefreshed) => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(isTokenRefreshed);

                if (!isTokenRefreshed) {
                    void this.authService.signOut();
                    return throwError(() => new Error('Token refresh failed'));
                }

                return next.handle(request);
            }),
            catchError((error) => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(false);
                void this.authService.signOut();
                return throwError(() => error);
            })
        );

    }
}

export const AuthInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true,
};
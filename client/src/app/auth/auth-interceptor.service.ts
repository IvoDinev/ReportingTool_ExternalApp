import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpParams,
} from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { take, exhaustMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private authService: AuthService) {}
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        if (
            req.url ===
            `https://reportin-app---authentication.firebaseio.com/domains.json`
        ) {
            return this.authService.user.pipe(
                take(1),
                exhaustMap((user) => {
                    const modifiedRequest = req.clone({
                        params: new HttpParams().set('auth', user.token),
                    });

                    return next.handle(modifiedRequest);
                })
            );
        } else {
            return next.handle(req);
        }
    }
}

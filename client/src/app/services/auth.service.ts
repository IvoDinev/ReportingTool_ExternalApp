import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from '@angular/common/http';
import { UserAuthResponse } from '../interfaces/user-auth-responseData';
import { throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, take, exhaustMap } from 'rxjs/operators';
import { User } from '../interfaces/user.model';
import { Router } from '@angular/router';
import { DomainCredentials } from '../interfaces/domainCredentials';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;
    domainsArray = [];

    constructor(private http: HttpClient, private router: Router) {}

    loginUser(mail: string, pass: string) {
        const body = {
            email: mail,
            password: pass,
            returnSecureToken: true,
        };
        return this.http
            .post<UserAuthResponse>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBKepAQ17F7Eyysp6HHWsIqQu72miZMSeY',
                body
            )
            .pipe(
                catchError(this.handleError),
                tap((resData) => {
                    this.handleAuthentication(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                })
            );
    }

    autoLogin() {
        const userData: {
            id: string;
            username: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData) {
            return;
        }
        const loadedUser = new User(
            userData.id,
            userData.username,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );

        if (loadedUser.token) {
            this.user.next(loadedUser);
            this.autoLogout(
                new Date(userData._tokenExpirationDate).getTime() -
                    new Date().getTime()
            );
        }
    }

    logoutUser() {
        this.user.next(null);
        this.router.navigate(['/auth']);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logoutUser();
        }, expirationDuration);
    }

    private handleAuthentication(
        email: string,
        userId: string,
        token: string,
        expiresIn: number
    ) {
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occured!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'User not found!';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'Invalid Password!';
                break;
            case 'USER_DISABLED':
                errorMessage = 'Account disabled!';
                break;
        }
        return throwError(errorMessage);
    }

    storeDomainCredentialsToDB(domainCredentials: DomainCredentials) {
        const body = {
            username: domainCredentials.username,
            password: domainCredentials.password,
        };
        return this.user.pipe(
            take(1),
            exhaustMap((user) => {
                return this.http.put(
                    `https://reportin-app---authentication.firebaseio.com/domains/${domainCredentials.domain}.json?auth=` +
                        user.token,
                    body
                );
            })
        );
    }

    storeDomains(domains: Array<any>) {
        for (const key in domains) {
            if (domains.hasOwnProperty(key)) {
                const object = {
                    domain: key,
                    credentials: domains[key],
                };
                this.domainsArray.push(object);
            }
        }
    }

    domainAdded(url: string): boolean {
        let added = false;
        this.domainsArray.forEach((element) => {
            if (element.domain === url) {
                added = true;
            }
        });
        return added;
    }

    getDomainCredentials() {
        return this.http.get<any>(
            `https://reportin-app---authentication.firebaseio.com/domains.json`
        );
    }

    encodeCredentials(username: string, password: string) {
        return btoa(`${username}:${password}`);
    }

    checkDomainCredentials(user: string, pass: string, domain: string) {
        const url = `/${domain}/rest/auth/1/session`;
        return this.http.get(url, this.setDomainRequestHeaders(user, pass));
    }

    setDomainRequestHeaders(user: string, pass: string) {
        const encodedCredentials = this.encodeCredentials(user, pass);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            }),
        };

        return httpOptions;
    }
}

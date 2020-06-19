import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    encodeCredentials(username: string, password: string) {
        return btoa(`${username}:${password}`);
    }
}

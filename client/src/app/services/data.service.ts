import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    constructor(private http: HttpClient, private authService: AuthService) {}

    getAllProjects(user: string, pass: string, domain: string) {
        const url = `/${domain}/rest/api/2/project`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(user, pass)
        );
    }
}

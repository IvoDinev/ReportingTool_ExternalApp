import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    constructor(private http: HttpClient, private authService: AuthService) {}

    getAllProjects(user: string, pass: string) {
        const encodedCredentials = this.authService.encodeCredentials(
            user,
            pass
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            }),
        };
        const url = `/jira/rest/api/2/project`;
        return this.http.get(url, httpOptions);
    }
}

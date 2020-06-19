import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    constructor(private http: HttpClient, private authService: AuthService) {}

    checkLoggedUser() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: 'Basic YWRtaW46YWRtaW4=',
            }),
        };
        const url = `/jira/rest/api/2/myself`;
        return this.http.get(url, httpOptions);
    }

    getNewProject(key: string, user: string, password: string) {
        const encodedCredentials = this.authService.encodeCredentials(
            user,
            password
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            }),
        };
        const url = `/jira/rest/api/2/project/${key}`;
        return this.http.get(url, httpOptions);
    }
}

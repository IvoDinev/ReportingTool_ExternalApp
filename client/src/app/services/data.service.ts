import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ProjectCredentials } from '../interfaces/projectCredentials';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    constructor(private http: HttpClient, private authService: AuthService) {}

    getProject(projectCredentials: ProjectCredentials) {
        const encodedCredentials = this.authService.encodeCredentials(
            projectCredentials.username,
            projectCredentials.password
        );
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Basic ${encodedCredentials}`,
            }),
        };
        const url = `/jira/rest/api/2/project/${projectCredentials.projectKey}`;
        return this.http.get(url, httpOptions);
    }
}

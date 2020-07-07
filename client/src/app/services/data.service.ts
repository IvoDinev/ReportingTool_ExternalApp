import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

import { DomainCredentials } from '../interfaces/domainCredentials';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    projectKeys = Array<string>();
    error = new BehaviorSubject<string>(null);

    constructor(private http: HttpClient, private authService: AuthService) {}

    getAllProjects(credentials: DomainCredentials) {
        const url = `/${credentials.domain}/rest/api/2/project`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }

    getKanbanBoard(projectKey: string, credentials: DomainCredentials) {
        const url = `/${credentials.domain}/rest/agile/1.0/board?projectKeyOrId=${projectKey}&type=Kanban`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }

    getCurrentFixVersion(credentials: DomainCredentials, versionId: number) {
        const url = `${credentials.domain}/rest/api/2/version/${versionId}`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }

    getFixVersions(credentials: DomainCredentials, boardId: number) {
        const url = `${credentials.domain}/rest/agile/1.0/board/${boardId}/version?released=false`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }

    getAllEpics(
        projectKey: string,
        fixVersion: string,
        credentials: DomainCredentials
    ) {
        // tslint:disable-next-line: max-line-length
        const url = `${credentials.domain}/rest/api/2/search?jql=project=${projectKey}%20AND%20issuetype=Epic%20AND%20fixVersion%20=%20"${fixVersion}"`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }

    getBugs(
        projectKey: string,
        fixVersion: string,
        credentials: DomainCredentials
    ) {
        // tslint:disable-next-line: max-line-length
        const url = `${credentials.domain}/rest/api/2/search?jql=project%20%3D%20${projectKey}%20AND%20issuetype%20%3D%20Bug%20AND%20fixVersion%20%3D%20"${fixVersion}"`;
        return this.http.get(
            url,
            this.authService.setDomainRequestHeaders(
                credentials.username,
                credentials.password
            )
        );
    }
}

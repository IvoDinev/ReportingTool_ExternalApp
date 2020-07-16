import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { DomainCredentials } from '../interfaces/domainCredentials';
import { Project } from '../interfaces/project';
import { ProjectOverview } from '../interfaces/project-overview';
import { concatMap, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    projectKeys = Array<string>();
    errorSubject = new BehaviorSubject<string>(null);
    error = null;
    projectSubject = new BehaviorSubject<ProjectOverview>(null);
    estimatedRelease: Date;
    completedEpicsRatio: number;
    bugsRatio: string;
    status: string;
    project: ProjectOverview;
    iterator = 0;

    constructor(private http: HttpClient, private authService: AuthService) {}

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

    getAllProjects(credentials: DomainCredentials) {
        this.http
            .get(
                `/${credentials.domain}/rest/api/2/project`,
                this.authService.setDomainRequestHeaders(
                    credentials.username,
                    credentials.password
                )
            )
            .subscribe(
                (projects: Array<Project>) => {
                    if (projects) {
                        this.error = null;
                        projects.forEach((project) => {
                            if (project.projectTypeKey === 'software') {
                                this.projectKeys.push(project.key);
                                this.getProjectData(
                                    project.key,
                                    credentials,
                                    project.name
                                );
                            }
                        });
                    }
                },
                (error) => {
                    this.handleError(error);
                }
            );
    }

    getProjectData(
        key: string,
        credentials: DomainCredentials,
        projectName: string
    ) {
        let boardId: number;
        const name = projectName;
        let currentFixVersionData;
        this.getKanbanBoard(key, credentials)
            .pipe(
                tap((board: any) => {
                    if (board && board.values.length > 0) {
                        boardId = board.values[0].id;
                    } else {
                        const errorMessage = `Project with key ${key} does not have a Kanban Board!`;
                        this.errorSubject.next(errorMessage);
                    }
                }),
                concatMap(() => this.getFixVersions(credentials, boardId)),
                tap((fixVersions: any) => {
                    if (fixVersions) {
                        fixVersions.values.forEach((fixVersion) => {
                            this.getCurrentFixVersion(
                                credentials,
                                fixVersion.id
                            ).subscribe((version: any) => {
                                currentFixVersionData = this.setCurrentFixVersion(
                                    version
                                );
                                if (
                                    currentFixVersionData !== undefined &&
                                    currentFixVersionData !== null &&
                                    this.iterator === 1
                                ) {
                                    this.setOverview(
                                        key,
                                        credentials,
                                        name,
                                        currentFixVersionData
                                    );
                                }
                            });
                        });
                    }
                })
            )
            .subscribe();
    }

    setCurrentFixVersion(version: any) {
        let fixVersionData: any;
        if (new Date(version.startDate) <= new Date()) {
            fixVersionData = {
                startDate: new Date(version.startDate),
                name: version.name,
                releaseDate: new Date(version.releaseDate),
            };
            this.iterator = 1;
            return fixVersionData;
        } else {
            this.iterator = 0;
            return null;
        }
    }

    setOverview(
        key: string,
        credentials: DomainCredentials,
        projectName: string,
        fixVersionData: any
    ) {
        let epics: any;
        let bugs: any;
        const completedEpics = [];
        let remainingEpics: number;
        let estimatedRelease: Date;
        let completedEpicsRatio: number;
        let bugsRatio: string;
        let status: string;
        forkJoin([
            this.getAllEpics(key, fixVersionData.name, credentials),
            this.getBugs(key, fixVersionData.name, credentials),
        ]).subscribe((results: any) => {
            epics = results[0];
            bugs = results[1];
            epics.issues.forEach((issue) => {
                if (issue.fields.status.name === 'Done') {
                    completedEpics.push(issue);
                }
            });
            remainingEpics = epics.issues.length - completedEpics.length;
            estimatedRelease = this.estimateRelease(
                completedEpics,
                remainingEpics
            );
            completedEpicsRatio =
                (completedEpics.length / epics.issues.length) * 100;
            bugsRatio = `${bugs.issues.length} / ${completedEpics.length}`;

            this.project = new ProjectOverview(
                projectName,
                fixVersionData.name,
                completedEpicsRatio,
                fixVersionData.startDate,
                fixVersionData.releaseDate,
                estimatedRelease,
                bugsRatio,
                (status = this.setStatus(fixVersionData))
            );
            this.projectSubject.next(this.project);
        });
    }

    estimateRelease(epics: Array<any>, uncompletedEpics: number): Date {
        let totalTimeSpent = 0;
        let avgTimePerEpic = 0;
        let timeNeeded = 0;
        let estimatedDate: Date;
        epics.forEach((doneEpic) => {
            totalTimeSpent += doneEpic.fields.timespent;
        });
        avgTimePerEpic = totalTimeSpent / epics.length;
        timeNeeded = avgTimePerEpic * uncompletedEpics;
        estimatedDate = new Date(new Date().getTime() + timeNeeded * 1000);
        return estimatedDate;
    }

    setStatus(fixVersionData): string {
        let status: string;
        if (fixVersionData.releaseDate < this.estimatedRelease) {
            status = 'Not OK';
        } else {
            status = 'OK';
        }
        return status;
    }

    handleError(error: any) {
        if (error.status === 401) {
            this.error = 'Invalid username or password!';
        } else {
            this.error = error.status;
        }
    }
}

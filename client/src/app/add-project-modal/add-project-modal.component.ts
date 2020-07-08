import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomainCredentials } from '../interfaces/domainCredentials';
import { Project } from '../interfaces/project';
import { tap, concatMap } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ProjectOverview } from '../interfaces/project-overview';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent {
    error = null;
    isAuthenticated = false;
    closeResult = '';
    errorSubject = new BehaviorSubject<string>(null);
    projectName: string;
    currentFixVersion: string;
    currentFixVersionDate: Date;
    releaseDate: Date;
    estimatedRelease: Date;
    completedEpicsRatio: number;
    bugsRatio: string;
    status: string;
    project: ProjectOverview;

    constructor(
        private dataService: DataService,
        private authService: AuthService,
        private modalService: NgbModal
    ) {}
    domainLoginForm = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        domain: new FormControl('', Validators.required),
    });

    open(content) {
        this.modalService
            .open(content, { ariaLabelledBy: 'modal-basic-title' })
            .result.then(
                () => {
                    this.closeResult = `Closed`;
                },
                () => {
                    this.closeResult = `Dismissed`;
                }
            );
    }

    onAuthenticate() {
        if (this.domainLoginForm.valid) {
            if (
                !this.authService.domainAdded(
                    this.domainLoginForm.controls.domain.value
                )
            ) {
                this.authenticateInDomain();
            } else {
                this.error = 'Domain added already !';
            }
        } else {
            alert('Populate the required fields');
        }
    }

    authenticateInDomain() {
        const credentials = {
            username: this.domainLoginForm.controls.username.value,
            password: this.domainLoginForm.controls.password.value,
            domain: this.domainLoginForm.controls.domain.value,
        };
        this.checkCredentials(credentials);
    }

    checkCredentials(credentials: DomainCredentials) {
        this.authService
            .checkDomainCredentials(
                credentials.username,
                credentials.password,
                credentials.domain
            )
            .subscribe(
                (response) => {
                    if (response) {
                        this.isAuthenticated = true;
                        const obj = {
                            domain: credentials.domain,
                            credentials: {
                                username: credentials.username,
                                password: credentials.password,
                            },
                        };
                        this.authService.domainsArray.push(obj);
                        this.authService
                            .storeDomainCredentialsToDB(credentials)
                            .subscribe();
                        this.addProjects(credentials);
                    }
                },
                (error) => {
                    this.handleError(error);
                }
            );
    }

    addProjects(credentials: DomainCredentials) {
        if (this.isAuthenticated) {
            this.dataService.getAllProjects(credentials).subscribe(
                (projects: Array<Project>) => {
                    if (projects) {
                        this.error = null;
                        // projects.forEach((project) => {
                        //     if (project.projectTypeKey === 'software') {
                        //         this.dataService.projectKeys.push(project.key);
                        //         projectName = project.name;
                        this.projectName = projects[1].name;
                        this.getProjectData(projects[1].key, credentials);
                    }
                },
                (error) => {
                    this.handleError(error);
                }
            );
            //}

            this.clearModal();
        }
    }
    handleError(error: any) {
        if (error.status === 401) {
            this.error = 'Invalid username or password!';
        } else {
            this.error = error.status;
        }
    }

    getProjectData(key: string, credentials: DomainCredentials) {
        let boardId: number;
        this.dataService
            .getKanbanBoard(key, credentials)
            .pipe(
                tap((board: any) => {
                    if (board && board.values.length > 0) {
                        boardId = board.values[0].id;
                    } else {
                        const errorMessage = `Project does not have a Kanban Board!`;
                        this.errorSubject.next(errorMessage);
                    }
                }),
                concatMap(() =>
                    this.dataService.getFixVersions(credentials, boardId)
                ),
                tap((fixVersions: any) => {
                    if (fixVersions) {
                        fixVersions.values.forEach((fixVersion) => {
                            this.dataService
                                .getCurrentFixVersion(
                                    credentials,
                                    fixVersion.id
                                )
                                .subscribe((version: any) => {
                                    this.setCurrentFixVersion(version);
                                    if (this.currentFixVersion !== undefined) {
                                        this.getBugsAndEpics(key, credentials);
                                    }
                                });
                        });
                    }
                })
            )
            .subscribe();
    }

    setCurrentFixVersion(version: any) {
        if (new Date(version.startDate) <= new Date()) {
            this.currentFixVersionDate = new Date(version.startDate);
            this.currentFixVersion = version.name;
            this.releaseDate = new Date(version.releaseDate);
        }
    }

    getBugsAndEpics(key: string, credentials: DomainCredentials) {
        let epics: any;
        let bugs: any;
        const completedEpics = [];
        let remainingEpics: number;
        forkJoin([
            this.dataService.getAllEpics(
                key,
                this.currentFixVersion,
                credentials
            ),
            this.dataService.getBugs(key, this.currentFixVersion, credentials),
        ]).subscribe((results: any) => {
            epics = results[0];
            bugs = results[1];
            epics.issues.forEach((issue) => {
                if (issue.fields.status.name === 'Done') {
                    completedEpics.push(issue);
                }
            });
            remainingEpics = epics.issues.length - completedEpics.length;
            this.estimatedRelease = this.estimateRelease(
                completedEpics,
                remainingEpics
            );
            this.completedEpicsRatio =
                completedEpics.length / epics.issues.length;
            this.bugsRatio = `${completedEpics.length} / ${bugs.issues.length}`;
            this.project = new ProjectOverview(
                this.projectName,
                this.currentFixVersion,
                this.completedEpicsRatio,
                this.currentFixVersionDate,
                this.releaseDate,
                this.estimatedRelease,
                this.bugsRatio,
                (this.status = this.setStatus())
            );
            console.log(this.project);
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

    setStatus(): string {
        let icon: string;
        if (this.releaseDate < this.estimatedRelease) {
            icon = `<i
            class="fa fa-exclamation-triangle"
            aria-hidden="true"
            style="color: red;"
        ></i>`;
        } else {
            icon = `<i class="fa fa-check" aria-hidden="true"></i>`;
        }

        return icon;
    }

    clearModal() {
        this.domainLoginForm.controls.username.setValue('');
        this.domainLoginForm.controls.password.setValue('');
        this.domainLoginForm.controls.domain.setValue('');
        this.modalService.dismissAll();
    }
}

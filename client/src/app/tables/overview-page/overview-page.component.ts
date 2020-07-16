import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DomainCredentials } from 'src/app/interfaces/domainCredentials';
import { ProjectOverview } from 'src/app/interfaces/project-overview';
import { DataService } from 'src/app/services/data.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-overview-page',
    templateUrl: './overview-page.component.html',
    styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent implements OnInit, OnDestroy {
    overviews = Array<ProjectOverview>();
    projectsDataSub: Subscription;
    private errorSub: Subscription;
    errorMessage = null;
    icon: string;
    style: any;
    constructor(
        private authService: AuthService,
        private dataService: DataService
    ) {}

    ngOnInit() {
        this.authService.getDomainCredentials().subscribe(
            (domains: Array<DomainCredentials>) => {
                if (domains) {
                    let credentials: DomainCredentials;
                    Object.keys(domains).forEach((key) => {
                        credentials = {
                            domain: key,
                            username: domains[key].username,
                            password: domains[key].password,
                        };
                        this.dataService.getAllProjects(credentials);
                    });

                    this.authService.storeDomains(domains);
                } else {
                    window.alert('No projects added yet !');
                    this.errorMessage = 'No projects to display!';
                }
            },
            (error) => {
                console.log(error);
            }
        );
        this.errorSub = this.dataService.errorSubject.subscribe(
            (errorMessage) => {
                this.errorMessage = errorMessage;
            }
        );
        this.projectsDataSub = this.dataService.projectSubject.subscribe(
            (project: ProjectOverview) => {
                if (project) {
                    if (project.status === 'OK') {
                        this.icon = `<i class="fa fa-check fa-lg" aria-hidden="true"></i>`;
                        this.style = { color: 'green' };
                    } else {
                        this.icon = `<i
                        //     class="fa fa-exclamation-triangle fa-lg"
                        //     aria-hidden="true"
                        // ></i>`;
                        this.style = { color: 'red' };
                    }
                    this.overviews.push(project);
                }
            }
        );
    }

    ngOnDestroy() {
        this.errorSub.unsubscribe();
    }
}

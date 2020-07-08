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
    constructor(
        private authService: AuthService,
        private dataService: DataService
    ) {}

    ngOnInit() {
        this.authService.getDomainCredentials().subscribe(
            (domains: Array<DomainCredentials>) => {
                if (domains) {
                    this.authService.storeDomains(domains);
                } else {
                    window.alert('No projects added yet !');
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
                    this.overviews.push(project);
                    console.log(this.overviews);
                }
            }
        );
    }

    ngOnDestroy() {
        this.errorSub.unsubscribe();
    }
}

import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectCredentials } from 'src/app/interfaces/projectCredentials';

@Component({
    selector: 'app-overview-page',
    templateUrl: './overview-page.component.html',
    styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent implements OnInit {
    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.authService.getProjectCredentials().subscribe(
            (projects: Array<ProjectCredentials>) => {
                if (projects) {
                    this.getExistingProjects(projects);
                } else {
                    window.alert('No projects available !');
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }

    getExistingProjects(projects: Array<ProjectCredentials>) {
        // tslint:disable-next-line: forin
        for (const project in projects) {
            const projectCredentials: ProjectCredentials = {
                projectKey: project,
                username: projects[project].username,
                password: projects[project].password,
            };
            this.dataService
                .getProject(projectCredentials)
                .subscribe((response) => {
                    console.log(response);
                });
        }
    }
}

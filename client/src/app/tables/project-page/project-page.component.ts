import { Component } from '@angular/core';
import { ProjectDetailedReport } from 'src/app/interfaces/project-DetailedReport';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.css'],
})
export class ProjectPageComponent {
    project: ProjectDetailedReport = {
        overview: {
            name: 'SOFT',
            fixVersion: 'RE 1.1',
            completedEpics: 50,
            start: new Date('01.03.2020'),
            plannedEnd: new Date('15.07.2020'),
            estimatedEnd: new Date('14.07.2020'),
            bugsRatio: 50,
            status: 'Ok',
        },
        members: 20,
        createdTasks: 100,
        finishedTasks: 50,
        inProgressTasks: 10,
        avgDaysPerTask: 2,
        avgCompletedSprintTasks: 18,
        completedPlannedTasksSprint: 80,
    };
}

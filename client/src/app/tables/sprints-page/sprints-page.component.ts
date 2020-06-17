import { Component, OnInit } from '@angular/core';
import { Sprint } from 'src/app/interfaces/sprint';

@Component({
    selector: 'app-sprints-page',
    templateUrl: './sprints-page.component.html',
    styleUrls: ['../tables.styles.css'],
})
export class SprintsPageComponent implements OnInit {
    sprint: Sprint = {
        sprintNumber: 1,
        phase: 'In Development',
        plannedTasks: 20,
        tasksInProgress: 5,
        finishedTasks: 5,
        day: 2,
    };

    sprintsArray: Array<Sprint> = [this.sprint];

    ngOnInit() {}
}

import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/interfaces/task';

@Component({
    selector: 'app-tasks-page',
    templateUrl: './tasks-page.component.html',
    styleUrls: ['../tables.styles.css'],
})
export class TasksPageComponent implements OnInit {
    task1: Task = {
        taskNumber: 1,
        type: 'FE',
        developer: 'Dinev',
        reviewer: 'Petrov',
        status: 'In Progress',
        timeElapsed: 1,
    };

    task2: Task = {
        taskNumber: 2,
        type: 'FE',
        developer: 'Dinev',
        reviewer: 'Petrov',
        status: 'Done',
        timeElapsed: 4,
    };

    tasksArray: Array<Task> = [this.task1, this.task2];
    ngOnInit() {}
}

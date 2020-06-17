import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent implements OnInit {
    constructor() {}
    addProjectForm = new FormGroup({
        projectKey: new FormControl(''),
    });

    ngOnInit() {}

    onSubmit() {
        window.alert('Adding project');
    }
}

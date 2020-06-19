import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DataService } from '../services/data.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent implements OnInit {
    constructor(private dataService: DataService) {}
    addProjectForm = new FormGroup({
        projectKey: new FormControl(''),
        username: new FormControl(''),
        password: new FormControl(''),
        domain: new FormControl(''),
    });

    ngOnInit() {}

    onSubmit() {
        window.alert('Adding project');
        this.addNewProject();
    }

    addNewProject() {
        this.dataService
            .getNewProject(
                this.addProjectForm.controls.projectKey.value,
                this.addProjectForm.controls.username.value,
                this.addProjectForm.controls.password.value
            )
            .subscribe((response) => {
                console.log(response);
            });
    }
}

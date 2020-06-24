import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent implements OnInit {
    error = null;
    isAuthenticated = false;

    constructor(
        private dataService: DataService,
        private authService: AuthService
    ) {}
    domainLoginForm = new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
        domain: new FormControl('', Validators.required),
    });
    addProjectForm = new FormGroup({
        projectKey: new FormControl('', Validators.required),
    });

    ngOnInit() {}

    onAuthenticate() {
        if (this.domainLoginForm.valid) {
            if (this.isAuthenticated === false) {
                this.authenticateInDomain();
            }
        } else {
            alert('Populate the required fields');
        }
    }

    authenticateInDomain() {
        const credentials = {
            username: this.domainLoginForm.controls.username.value,
            password: this.domainLoginForm.controls.password.value,
        };
        this.checkCredentials(credentials);
    }

    checkCredentials(credentials) {
        this.authService
            .checkProjectCredentials(credentials.username, credentials.password)
            .subscribe(
                (response) => {
                    if (response) {
                        this.isAuthenticated = true;
                    }
                },
                (error) => {
                    if (error.status === 401) {
                        this.error = 'Invalid username or password !';
                    } else {
                        this.error = error.statusText;
                    }
                }
            );
    }

    getProjectData(projectCredentials) {
        this.dataService.getProject(projectCredentials).subscribe(
            (response) => {
                if (response) {
                    console.log(response);
                }
            },
            (error) => {
                if (error.status === 404) {
                    this.error = 'No project found with this project Key!';
                } else if (error.status === 401) {
                    this.error = 'Invalid username or password!';
                } else {
                    this.error = error.status;
                }
            }
        );
    }

    changeDomain() {
        this.isAuthenticated = false;
    }
}

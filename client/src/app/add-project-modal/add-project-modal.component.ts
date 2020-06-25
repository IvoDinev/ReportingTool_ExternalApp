import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomainCredentials } from '../interfaces/domainCredentials';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent implements OnInit {
    error = null;
    isAuthenticated = false;
    closeResult = '';

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

    ngOnInit() {}

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
            this.authenticateInDomain();
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
            .checkDomainCredentials(credentials.username, credentials.password)
            .subscribe(
                (response) => {
                    if (response) {
                        this.isAuthenticated = true;
                        this.authService
                            .storeDomainCredentials(credentials)
                            .subscribe();
                        this.addProjects();
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

    addProjects() {
        if (this.isAuthenticated) {
            this.dataService
                .getAllProjects(
                    this.domainLoginForm.controls.username.value,
                    this.domainLoginForm.controls.password.value
                )
                .subscribe(
                    (project) => {
                        if (project) {
                            console.log(project);
                            this.error = null;
                            this.domainLoginForm.controls.username.setValue('');
                            this.domainLoginForm.controls.password.setValue('');
                            this.domainLoginForm.controls.domain.setValue('');
                            this.modalService.dismissAll();
                        }
                    },
                    (error) => {
                        if (error.status === 404) {
                            this.error =
                                'No project found with this project Key!';
                        } else if (error.status === 401) {
                            this.error = 'Invalid username or password!';
                        } else {
                            this.error = error.status;
                        }
                    }
                );
        }
    }
}

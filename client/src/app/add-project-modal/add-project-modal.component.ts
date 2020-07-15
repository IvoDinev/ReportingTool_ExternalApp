import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomainCredentials } from '../interfaces/domainCredentials';
import { BehaviorSubject } from 'rxjs';

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'add-project-modal',
    templateUrl: './add-project-modal.component.html',
    styleUrls: ['./add-project-modal.component.css'],
})
export class AddProjectModalComponent {
    error = null;
    isAuthenticated = false;
    closeResult = '';
    errorSubject = new BehaviorSubject<string>(null);

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
            if (
                !this.authService.domainAdded(
                    this.domainLoginForm.controls.domain.value
                )
            ) {
                this.checkCredentials();
            } else {
                this.error = 'Domain added already !';
            }
        } else {
            alert('Populate the required fields');
        }
    }

    checkCredentials() {
        const credentials = {
            username: this.domainLoginForm.controls.username.value,
            password: this.domainLoginForm.controls.password.value,
            domain: this.domainLoginForm.controls.domain.value,
        };
        this.authService
            .checkDomainCredentials(
                credentials.username,
                credentials.password,
                credentials.domain
            )
            .subscribe(
                (response) => {
                    if (response) {
                        this.isAuthenticated = true;
                        const obj = {
                            domain: credentials.domain,
                            credentials: {
                                username: credentials.username,
                                password: credentials.password,
                            },
                        };
                        this.authService.domainsArray.push(obj);
                        this.authService
                            .storeDomainCredentialsToDB(credentials)
                            .subscribe();
                        this.addProjects(credentials);
                    }
                },
                (error) => {
                    this.handleError(error);
                }
            );
    }

    addProjects(credentials: DomainCredentials) {
        if (this.isAuthenticated) {
            this.dataService.getAllProjects(credentials);
            this.clearModal();
        }
    }

    clearModal() {
        this.domainLoginForm.controls.username.setValue('');
        this.domainLoginForm.controls.password.setValue('');
        this.domainLoginForm.controls.domain.setValue('');
        this.modalService.dismissAll();
    }

    handleError(error: any) {
        if (error.status === 401) {
            this.error = 'Invalid username or password!';
        } else {
            this.error = error.status;
        }
    }
}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
    constructor(private authService: AuthService, private router: Router) {}
    loginForm: FormGroup;
    error = null;

    ngOnInit() {
        this.loginForm = new FormGroup({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
        });
    }
    onSubmit() {
        if (!this.loginForm.valid) {
            alert('Please enter e-mail and password!');
        } else {
            this.authService
                .loginUser(
                    this.loginForm.controls.email.value,
                    this.loginForm.controls.password.value
                )
                .subscribe(
                    () => {
                        this.router.navigate(['/overview']);
                    },
                    (error) => {
                        this.error = error;
                    }
                );
        }
    }
}

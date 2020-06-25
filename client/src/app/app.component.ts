import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
    isAuthenticated = false;
    private userSub: Subscription;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.userSub = this.authService.user.subscribe((user) => {
            this.isAuthenticated = !user ? false : true;
        });
        this.authService.autoLogin();
    }

    ngOnDestroy() {
        this.userSub.unsubscribe();
    }
}

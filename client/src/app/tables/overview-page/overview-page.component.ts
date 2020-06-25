import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DomainCredentials } from 'src/app/interfaces/domainCredentials';

@Component({
    selector: 'app-overview-page',
    templateUrl: './overview-page.component.html',
    styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent implements OnInit {
    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.authService.getDomainCredentials().subscribe(
            (domains: Array<DomainCredentials>) => {
                if (domains) {
                    console.log(domains);
                } else {
                    window.alert('No projects added yet !');
                }
            },
            (error) => {
                console.log(error);
            }
        );
    }
}

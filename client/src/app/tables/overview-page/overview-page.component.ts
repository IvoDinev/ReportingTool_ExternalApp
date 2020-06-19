import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
    selector: 'app-overview-page',
    templateUrl: './overview-page.component.html',
    styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent implements OnInit {
    constructor(private dataService: DataService) {}

    ngOnInit() {
        this.dataService.checkLoggedUser().subscribe((response) => {
            console.log(response);
        });
    }
}

import { Component } from '@angular/core';
import { VERSION } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
})
export class AppComponent {
    loadedTab = 'project';

    onNavigate(tab: string) {
        this.loadedTab = tab;
    }
}

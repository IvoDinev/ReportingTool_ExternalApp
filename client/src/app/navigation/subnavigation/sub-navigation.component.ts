import { Component, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-subnavigation',
    templateUrl: './sub-navigation.component.html',
    styleUrls: ['./sub-navigation.component.css'],
})
export class SubNavigationComponent {
    @Output() selectedTab = new EventEmitter<string>();

    selectTab(tab: string) {
        this.selectedTab.emit(tab);
    }
}

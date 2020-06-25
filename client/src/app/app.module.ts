import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProjectPageComponent } from './tables/project-page/project-page.component';
import { TasksPageComponent } from './tables/tasks-page/tasks-page.component';
import { SprintsPageComponent } from './tables/sprints-page/sprints-page.component';
import { OverviewPageComponent } from './tables/overview-page/overview-page.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AddProjectModalComponent } from './add-project-modal/add-project-modal.component';
import {
    HttpClientModule,
    HttpClient,
    HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { AuthComponent } from './auth/auth.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptorService } from './auth/auth-interceptor.service';

@NgModule({
    declarations: [
        AppComponent,
        ProjectPageComponent,
        TasksPageComponent,
        SprintsPageComponent,
        OverviewPageComponent,
        NavigationComponent,
        AddProjectModalComponent,
        AuthComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
    ],
    providers: [
        HttpClient,
        DataService,
        AuthService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}

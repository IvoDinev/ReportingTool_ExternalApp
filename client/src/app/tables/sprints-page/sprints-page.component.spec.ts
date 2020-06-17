import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SprintsPageComponent } from './sprints-page.component';

describe('SprintsPageComponent', () => {
  let component: SprintsPageComponent;
  let fixture: ComponentFixture<SprintsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SprintsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SprintsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFabricComponent } from './app-fabric.component';

describe('AppFabricComponent', () => {
  let component: AppFabricComponent;
  let fixture: ComponentFixture<AppFabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppFabricComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppFabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

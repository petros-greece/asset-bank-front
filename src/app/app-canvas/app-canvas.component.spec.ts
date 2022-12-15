import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCanvasComponent } from './app-canvas.component';

describe('AppCanvasComponent', () => {
  let component: AppCanvasComponent;
  let fixture: ComponentFixture<AppCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceCanvasComponent } from './face-canvas.component';

describe('FaceCanvasComponent', () => {
  let component: FaceCanvasComponent;
  let fixture: ComponentFixture<FaceCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FaceCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaceCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

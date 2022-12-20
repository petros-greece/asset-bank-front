import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageEffectsCanvasComponent } from './image-effects-canvas.component';

describe('ImageEffectsCanvasComponent', () => {
  let component: ImageEffectsCanvasComponent;
  let fixture: ComponentFixture<ImageEffectsCanvasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageEffectsCanvasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageEffectsCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

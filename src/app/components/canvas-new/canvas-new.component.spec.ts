import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasNewComponent } from './canvas-new.component';

describe('CanvasNewComponent', () => {
  let component: CanvasNewComponent;
  let fixture: ComponentFixture<CanvasNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CanvasNewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

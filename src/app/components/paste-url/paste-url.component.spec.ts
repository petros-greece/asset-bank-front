import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasteUrlComponent } from './paste-url.component';

describe('PasteUrlComponent', () => {
  let component: PasteUrlComponent;
  let fixture: ComponentFixture<PasteUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PasteUrlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasteUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

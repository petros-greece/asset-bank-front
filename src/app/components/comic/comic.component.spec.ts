import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComicComponent } from './comic.component';

describe('ComicComponent', () => {
  let component: ComicComponent;
  let fixture: ComponentFixture<ComicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

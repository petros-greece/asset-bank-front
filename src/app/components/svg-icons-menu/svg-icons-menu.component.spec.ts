import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgIconsMenuComponent } from './svg-icons-menu.component';

describe('SvgIconsMenuComponent', () => {
  let component: SvgIconsMenuComponent;
  let fixture: ComponentFixture<SvgIconsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SvgIconsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgIconsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

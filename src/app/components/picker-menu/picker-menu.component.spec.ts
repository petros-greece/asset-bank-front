import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickerMenuComponent } from './picker-menu.component';

describe('PickerMenuComponent', () => {
  let component: PickerMenuComponent;
  let fixture: ComponentFixture<PickerMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PickerMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PickerMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

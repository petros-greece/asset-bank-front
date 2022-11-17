import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletPickerComponent } from './pallet-picker.component';

describe('PalletPickerComponent', () => {
  let component: PalletPickerComponent;
  let fixture: ComponentFixture<PalletPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PalletPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PalletPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

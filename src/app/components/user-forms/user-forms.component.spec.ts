import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormsComponent } from './user-forms.component';

describe('UserFormsComponent', () => {
  let component: UserFormsComponent;
  let fixture: ComponentFixture<UserFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFormsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

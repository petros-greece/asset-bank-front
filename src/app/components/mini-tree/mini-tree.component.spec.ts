import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniTreeComponent } from './mini-tree.component';

describe('MiniTreeComponent', () => {
  let component: MiniTreeComponent;
  let fixture: ComponentFixture<MiniTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniFabricComponent } from './mini-fabric.component';

describe('MiniFabricComponent', () => {
  let component: MiniFabricComponent;
  let fixture: ComponentFixture<MiniFabricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiniFabricComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniFabricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

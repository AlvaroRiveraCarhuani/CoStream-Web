import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomJoin } from './room-join';

describe('RoomJoin', () => {
  let component: RoomJoin;
  let fixture: ComponentFixture<RoomJoin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomJoin],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomJoin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

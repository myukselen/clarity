import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClrDropPositionComponent } from './drop-position.component';

@Component({
  template: `<clr-drop-position #dropPositionBefore></clr-drop-position>`,
})
class TestComponent {
  @ViewChild('dropPositionBefore') dropPositionBefore: ClrDropPositionComponent<void>;
}

describe('ClrDropPositionComponent', () => {
  let component: ClrDropPositionComponent<void>;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance.dropPositionBefore;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

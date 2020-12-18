import { Component, ViewChild } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { spec, TestContext } from '../../utils/testing/helpers.spec';

import { ClrDropPositionComponent } from './drop-position.component';
import { TreeDndManagerService } from './tree-dnd-manager.service';
import { TreeFocusManagerService } from './tree-focus-manager.service';
import { ClrTreeViewModule } from './tree-view.module';
import { ClrIconModule } from '../../icon/icon.module';

@Component({
  template: `<clr-drop-position #dropPositionBefore></clr-drop-position>`,
})
class TestComponent {
  @ViewChild('dropPositionBefore') dropPositionBefore: ClrDropPositionComponent<void>;
}

export default function (): void {
  describe('ClrDropPosition Component', function () {
    type Context = TestContext<ClrDropPositionComponent<void>, TestComponent>;

    spec(ClrDropPositionComponent, TestComponent, ClrTreeViewModule, {
      imports: [NoopAnimationsModule, ClrIconModule],
      providers: [TreeFocusManagerService, TreeDndManagerService],
    });

    /*
    let fixture: ComponentFixture<TestComponent>;
    let component: ClrDropPositionComponent<void>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [ClrTreeViewModule, NoopAnimationsModule],
      });

      fixture = TestBed.createComponent(TestComponent);
      component = fixture.componentInstance.dropPositionBefore;
      fixture.detectChanges();
    });
    */

    it('should create', function (this: Context) {
      expect(this.hostComponent).toBeTruthy();
    });
  });
}

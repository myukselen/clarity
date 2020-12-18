import { TestBed } from '@angular/core/testing';

import { TreeDndManagerService } from './tree-dnd-manager.service';
import { TreeFocusManagerService } from './tree-focus-manager.service';

export default function (): void {
  describe('TreeDndManagerService', () => {
    let service: TreeDndManagerService<void>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [TreeDndManagerService, TreeFocusManagerService],
      });
      service = TestBed.inject(TreeDndManagerService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });
}

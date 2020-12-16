import { TestBed } from '@angular/core/testing';

import { TreeDndManagerService } from './tree-dnd-manager.service';

describe('TreeDndManagerService', () => {
  let service: TreeDndManagerService<void>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeDndManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/*
 * Copyright (c) 2016-2020 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Component } from '@angular/core';

@Component({
  selector: 'clr-dnd-eager-declarative-tree-demo',
  styleUrls: ['../tree-view.demo.scss'],
  templateUrl: './dnd-eager-declarative-tree.html',
})
export class DndEagerDeclarativeTreeDemo {
  expanded1 = true;
  expanded2 = true;

  appendTo(nodeId, $event) {
    console.log('appendTo', nodeId, $event);
  }
  insertBefore(nodeId, $event) {
    console.log('insertBefore', nodeId, $event);
  }
  insertBeforeAfter(nodeId, $event) {
    console.log('insertBeforeAfter', nodeId, $event);
  }
}

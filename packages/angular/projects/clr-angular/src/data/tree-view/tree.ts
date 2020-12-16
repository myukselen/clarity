/*
 * Copyright (c) 2016-2020 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  QueryList,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { UNIQUE_ID, UNIQUE_ID_PROVIDER } from '../../utils/id-generator/id-generator.service';
import { TreeFocusManagerService } from './tree-focus-manager.service';
import { TreeFeaturesService, TREE_FEATURES_PROVIDER } from './tree-features.service';
import { ClrTreeNode } from './tree-node';
import { TreeDndManagerService } from './tree-dnd-manager.service';
import { delay, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'clr-tree',
  template: `
    <ng-content></ng-content>
    <clr-recursive-children
      *ngIf="featuresService.recursion"
      [children]="featuresService.recursion.root"
    ></clr-recursive-children>
  `,
  providers: [UNIQUE_ID_PROVIDER, TREE_FEATURES_PROVIDER, TreeFocusManagerService, TreeDndManagerService],
  host: {
    '[attr.tabindex]': 'tabindex',
    '[attr.role]': '"tree"',
    '[attr.aria-multiselectable]': 'isMultiSelectable',
  },
})
export class ClrTree<T> implements AfterContentInit, OnDestroy {
  constructor(
    @Inject(UNIQUE_ID) public treeId: string,
    public featuresService: TreeFeaturesService<T>,
    private focusManagerService: TreeFocusManagerService<T>,
    private dndManagerService: TreeDndManagerService<T>,
    private el: ElementRef
  ) {}

  private subscriptions: Subscription[] = [];

  @Input('clrLazy')
  set lazy(value: boolean) {
    this.featuresService.eager = !value;
  }

  tabindex = 0;

  get isMultiSelectable() {
    return this.featuresService.selectable && this.rootNodes.length > 0;
  }

  @HostListener('focusin', ['$event'])
  onFocusIn(event: FocusEvent) {
    if (event.target === this.el.nativeElement) {
      // After discussing with the team, I've made it so that when the tree receives focus, the first visible node will be focused.
      // This will prevent from the page scrolling abruptly to the first selected node if it exist in a deeply nested tree.
      this.focusManagerService.focusFirstVisibleNode();

      // when the first child gets focus,
      // tree should no longer have tabindex of 0;
      delete this.tabindex;
    }
  }

  @ContentChildren(ClrTreeNode) private rootNodes: QueryList<ClrTreeNode<T>>;

  ngAfterContentInit() {
    this.subscriptions.push(
      this.rootNodes.changes
        .pipe(
          startWith(null),
          delay(0),
          tap(() => {
            this.setRootNodes();
          })
        )
        .subscribe()
    );
  }

  private setRootNodes(): void {
    // if node has no parent, it's a root node
    // for recursive tree, this.rootNodes registers also nested children
    // so we have to use filter to extract the ones that are truly root nodes
    const rootNodeModels = this.rootNodes.map(node => node._model).filter(node => !node.parent);
    // set firstNode of nodes with parent
    this.rootNodes
      .map(node => node._model)
      .map(node => {
        if (node.parent) {
          node.firstNode = node.parent.children.indexOf(node) === 0;
        }
      });
    // set firstNode of roots
    rootNodeModels.forEach(node => (node.firstNode = false));
    if (rootNodeModels.length > 0) {
      rootNodeModels[0].firstNode = true;
    }
    this.focusManagerService.rootNodeModels = rootNodeModels;
    this.dndManagerService.rootNodeModels = rootNodeModels;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

/*
 * Copyright (c) 2016-2020 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TreeViewDemo } from './tree-view.demo';
import { EagerDeclarativeTreeDemo } from './eager-declarative-tree/eager-declarative-tree';
import { EagerRecursiveTreeDemo } from './eager-recursive-tree/eager-recursive-tree';
import { LazyDeclarativeTreeDemo } from './lazy-declarative-tree/lazy-declarative-tree';
import { LazyRecursiveTreeDemo } from './lazy-recursive-tree/lazy-recursive-tree';
import { NodesWithIconsDemo } from './nodes-with-icons/nodes-with-icons';
import { TreeNodeRoutingDemo } from './tree-node-routing/tree-node-routing';
import { TreeNodeRoutingAbbeyRoadDemo } from './tree-node-routing/tree-node-routing-abbey-road';
import { TreeNodeRoutingRevolverDemo } from './tree-node-routing/tree-node-routing-revolver';
import { TreeNodeRoutingRubberSoulDemo } from './tree-node-routing/tree-node-routing-rubber-soul';
import { PreSelectionDemo } from './pre-selection/pre-selection';
import { DndEagerDeclarativeTreeDemo } from './dnd-eager-declarative-tree/dnd-eager-declarative-tree';
import { DndEagerRecursiveTreeDemo } from './dnd-eager-recursive-tree/dnd-eager-recursive-tree';

const ROUTES: Routes = [
  {
    path: '',
    component: TreeViewDemo,
    children: [
      { path: '', redirectTo: 'dnd-eager-declarative', pathMatch: 'full' },
      { path: 'dnd-eager-declarative', component: DndEagerDeclarativeTreeDemo },
      { path: 'dnd-eager-recursive', component: DndEagerRecursiveTreeDemo },
      { path: 'eager-declarative', component: EagerDeclarativeTreeDemo },
      { path: 'eager-recursive', component: EagerRecursiveTreeDemo },
      { path: 'lazy-declarative', component: LazyDeclarativeTreeDemo },
      { path: 'lazy-recursive', component: LazyRecursiveTreeDemo },
      { path: 'nodes-with-icons', component: NodesWithIconsDemo },
      {
        path: 'routing',
        component: TreeNodeRoutingDemo,
        children: [
          { path: 'album1', component: TreeNodeRoutingAbbeyRoadDemo },
          { path: 'album2', component: TreeNodeRoutingRevolverDemo },
          { path: 'album3', component: TreeNodeRoutingRubberSoulDemo },
        ],
      },
      { path: 'pre-selection', component: PreSelectionDemo },
    ],
  },
];

export const ROUTING: ModuleWithProviders<RouterModule> = RouterModule.forChild(ROUTES);

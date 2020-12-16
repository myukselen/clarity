import { Injectable } from '@angular/core';
import { TreeNodeModel } from './models/tree-node.model';
import { ClrDropTargetType } from './models/drop-target-type.enum';
import { ClrDropPositionComponent } from './drop-position.component';
import { TreeFocusManagerService } from './tree-focus-manager.service';
import { Subject, Observable } from 'rxjs';
import { ClrDragEvent } from '../../utils/drag-and-drop/drag-event';
import { DragEventType, DragPointPosition } from '../../utils/drag-and-drop/interfaces/drag-event.interface';
import { DroppableOverlapResolverService } from '../../utils/drag-and-drop/providers/droppable-overlap-resolver.service';
import { GlobalDragModeService } from '../../utils/drag-and-drop/providers/global-drag-mode.service';
import { DragAndDropEventBusService } from '../../utils/drag-and-drop/providers/drag-and-drop-event-bus.service';

const BEFORE_PREFIX = 'before-';
const AFTER_PREFIX = 'after-';

export class TreeTraversal<T> {
  public rootNodeModels: TreeNodeModel<T>[];

  findSiblings(model: TreeNodeModel<T>): TreeNodeModel<T>[] {
    // the method will return not only sibling models but also itself among them
    if (model.parent) {
      return model.parent.children;
    } else {
      return this.rootNodeModels;
    }
  }

  findLastVisibleInNode(model: TreeNodeModel<T>): TreeNodeModel<T> {
    // the method will traverse through until it finds the last visible node from the given node
    if (!model) {
      return;
    }
    if (model.expanded && model.children.length > 0) {
      const children = model.children;
      const lastChild = children[children.length - 1];
      return this.findLastVisibleInNode(lastChild);
    } else {
      return model;
    }
  }

  findNodeAbove(model: TreeNodeModel<T>): TreeNodeModel<T> {
    if (!model) {
      return;
    }

    const siblings = this.findSiblings(model);
    const selfIndex = siblings.indexOf(model);

    if (selfIndex === 0) {
      return model.parent;
    } else if (selfIndex > 0) {
      return this.findLastVisibleInNode(siblings[selfIndex - 1]);
    }
  }

  findNextFocusable(model: TreeNodeModel<T>): TreeNodeModel<T> {
    if (!model) {
      return;
    }

    const siblings = this.findSiblings(model);
    const selfIndex = siblings.indexOf(model);

    if (selfIndex < siblings.length - 1) {
      return siblings[selfIndex + 1];
    } else if (selfIndex === siblings.length - 1) {
      return this.findNextFocusable(model.parent);
    }
  }

  findNodeBelow(model: TreeNodeModel<T>): TreeNodeModel<T> {
    if (!model) {
      return;
    }

    if (model.expanded && model.children.length > 0) {
      return model.children[0];
    } else {
      return this.findNextFocusable(model);
    }
  }

  findSiblingAbove(model: TreeNodeModel<T>): TreeNodeModel<T> {
    if (!model) {
      return;
    }
    const siblings = this.findSiblings(model);
    const selfIndex = siblings.indexOf(model);
    if (selfIndex > 0) {
      return siblings[selfIndex - 1];
    }
    return;
  }

  findSiblingBelow(model: TreeNodeModel<T>): TreeNodeModel<T> {
    if (!model) {
      return;
    }
    const siblings = this.findSiblings(model);
    const selfIndex = siblings.indexOf(model);
    if (siblings.length > selfIndex + 1) {
      return siblings[selfIndex + 1];
    }
    return;
  }
}

@Injectable()
export class TreeDndManagerService<T> {
  private treeTraversal = new TreeTraversal<T>();
  private _rootNodeModels: TreeNodeModel<T>[];
  set rootNodeModels(rootNodeModels: TreeNodeModel<T>[]) {
    this._rootNodeModels = rootNodeModels;
    this.treeTraversal.rootNodeModels = rootNodeModels;
  }
  public globalDragModeService: GlobalDragModeService; // could not inject from constructor :(
  public eventBus: DragAndDropEventBusService<T>; // could not inject from constructor :(
  // public dropPositions: Map<string, ClrDropPositionComponent> = new Map<string, ClrDropPositionComponent>();

  // .scrollIntoView({block: 'nearest', behavior: 'smooth'})
  // .getBoundingClientRect ref: https://stackoverflow.com/a/11396681/8776239

  // overlapping position handling
  // position top to list? tree traversal

  public dragMode = false;
  public group: string | string[];
  public grabbedNode: TreeNodeModel<T>;
  public targetId: string;
  public targetType: ClrDropTargetType;

  private _draggableOverRequest: Subject<string> = new Subject();
  get draggableOverRequest(): Observable<string> {
    return this._draggableOverRequest.asObservable();
  }
  publishDraggableOverRequest(): void {
    this._draggableOverRequest.next(this.targetId);
  }

  private _dropRequest: Subject<ClrDragEvent<T>> = new Subject();
  get dropRequest(): Observable<ClrDragEvent<T>> {
    return this._dropRequest.asObservable();
  }
  publishDropRequest(dragEndEvent: ClrDragEvent<T>) {
    this._dropRequest.next(dragEndEvent);
  }

  constructor(
    private focusManager: TreeFocusManagerService<T>,
    private overlapResolver: DroppableOverlapResolverService<T>
  ) {}

  addDropPosition(nodeId: string, dropPosition: ClrDropPositionComponent<T>) {
    console.log('add pos', nodeId, dropPosition);
  }
  removeDropPosition(nodeId: string, dropPosition: ClrDropPositionComponent<T>) {
    console.log('remove pos', nodeId, dropPosition);
  }

  isCurrentTargetTypeParent() {
    return this.targetType === ClrDropTargetType.PARENT;
  }

  start(model: TreeNodeModel<T>, clientCenter: DragPointPosition, group: string | string[] | null) {
    this.dragMode = true;
    this.group = group;
    this.globalDragModeService.enter();

    const dragStartEvent = {
      type: DragEventType.DRAG_START,
      dragPosition: {
        pageX: clientCenter.pageX,
        pageY: clientCenter.pageY,
        moveX: 0,
        moveY: 0,
      },
      group: group,
      dragDataTransfer: model.model,
      ghostElement: null,
    };
    this.eventBus.broadcast(dragStartEvent);

    this.grabbedNode = model;
    this.targetId = model.nodeId;
    this.targetType = ClrDropTargetType.PARENT;
  }

  stop(commit: boolean, clientCenter: DragPointPosition) {
    const dragEndEvent = {
      type: DragEventType.DRAG_END,
      dragPosition: {
        pageX: clientCenter.pageX,
        pageY: clientCenter.pageY,
        moveX: 0,
        moveY: 0,
      },
      group: this.group,
      dragDataTransfer: this.grabbedNode.model,
      ghostElement: null,
    };
    this.eventBus.broadcast(dragEndEvent);
    this.dragMode = false;
    this.globalDragModeService.exit();
    if (commit) {
      const dropEvent = new ClrDragEvent({
        type: DragEventType.DROP,
        // dragPosition: null,
        dragPosition: {
          pageX: clientCenter.pageX,
          pageY: clientCenter.pageY,
          moveX: 0,
          moveY: 0,
        },
        dragDataTransfer: this.grabbedNode.model,
      });
      this.publishDropRequest(dropEvent);
    }
    delete this.group;
    this.grabbedNode = null;
    this.targetId = null;
    this.targetType = null;
    this.publishDraggableOverRequest(); // cleanup
  }

  traverseUp(model: TreeNodeModel<T>) {
    if (this.targetType === ClrDropTargetType.PARENT) {
      if (model.firstNode) {
        this.targetId = BEFORE_PREFIX + model.nodeId;
        this.targetType = ClrDropTargetType.POSITION;
      } else {
        /*
        // we have a sibling, up? didn't like the navigation
        const siblingNode = this.treeTraversal.findSiblingAbove(model);
        if (siblingNode) {
          this.focusManager.focusNode(siblingNode);
          // we should have an after now
          this.targetId = AFTER_PREFIX + siblingNode.nodeId;
          this.targetType = ClrDropTargetType.POSITION;
        } else {
          console.log('FAIL, dnd already at top but firstNode did not pick');
          // this.targetType = ClrDropTargetType.POSITION;
          // this.targetId = this.lastTreePositionId;
          return;
        }
        */

        // same as down logic, user can do left and move up quickly
        const nextNode = this.treeTraversal.findNodeAbove(model);
        if (nextNode) {
          this.focusManager.focusNode(nextNode);
          // we should have an after now
          const nextTargetId = AFTER_PREFIX + nextNode.nodeId;
          this.targetId = nextTargetId;
          this.targetType = ClrDropTargetType.POSITION;
        } else {
          console.log('FAIL, dnd already at top but firstNode did not pick');
          // this.targetType = ClrDropTargetType.POSITION;
          // this.targetId = this.lastTreePositionId;
          return;
        }
      }
      console.log('up to', this.targetId, this.targetType);
      this.publishDraggableOverRequest();
    } else {
      // position type
      if (this.targetId.startsWith(AFTER_PREFIX)) {
        // go back to current node
        this.targetId = model.nodeId;
        this.targetType = ClrDropTargetType.PARENT;
        console.log('up to', this.targetId, this.targetType);
        this.publishDraggableOverRequest();
      } else {
        // before prefix
        // we should focus above node
        const nextNode = this.treeTraversal.findNodeAbove(model);
        if (nextNode) {
          this.focusManager.focusNode(nextNode);
          this.targetId = nextNode.nodeId;
          this.targetType = ClrDropTargetType.PARENT;
          console.log('up to', this.targetId, this.targetType);
          this.publishDraggableOverRequest();
        } else {
          console.log('dnd already at top');
        }
      }
    }
  }

  traverseDown(model: TreeNodeModel<T>) {
    if (this.targetType === ClrDropTargetType.PARENT) {
      // try to traverse into and pick before
      if (model.expanded && model.children.length > 0) {
        const nextNode = this.treeTraversal.findNodeBelow(model);
        if (nextNode && nextNode.firstNode) {
          this.focusManager.focusNode(nextNode);
          // we should have a before now
          const nextTargetId = BEFORE_PREFIX + nextNode.nodeId;
          this.targetId = nextTargetId;
          this.targetType = ClrDropTargetType.POSITION;
        }
      } else {
        // we should have after
        const nextTargetId = AFTER_PREFIX + this.targetId; // same as model.nodeId
        this.targetId = nextTargetId;
        this.targetType = ClrDropTargetType.POSITION;
      }
      console.log('down to', this.targetId, this.targetType);
      this.publishDraggableOverRequest();
    } else {
      // position type
      if (this.targetId.startsWith(AFTER_PREFIX)) {
        let nextNode = this.treeTraversal.findSiblingBelow(model);
        if (!nextNode) {
          nextNode = this.treeTraversal.findNodeBelow(model);
        }
        if (nextNode) {
          this.focusManager.focusNode(nextNode);
          this.targetId = nextNode.nodeId;
          this.targetType = ClrDropTargetType.PARENT;
          console.log('down to', this.targetId, this.targetType);
          this.publishDraggableOverRequest();
        } else {
          console.log('dnd already at the bottom, noop');
        }
      } else {
        // before prefix
        // we are already focused
        // we should get back to node
        this.targetId = model.nodeId;
        this.targetType = ClrDropTargetType.PARENT;
        console.log('down to', this.targetId, this.targetType);
        this.publishDraggableOverRequest();
      }
    }
  }

  traverseRight(model: TreeNodeModel<T>) {
    if (this.targetType === ClrDropTargetType.PARENT) {
      // It should be handled in ClrTreeNode
    } else {
      if (model.children && model.children.length > 0) {
        const lastChild = model.children[model.children.length - 1];
        this.focusManager.focusNode(lastChild);
        this.targetId = AFTER_PREFIX + lastChild.nodeId;
        this.targetType = ClrDropTargetType.POSITION;
        console.log('right to', this.targetId, this.targetType);
        this.publishDraggableOverRequest();
      }
    }
  }

  traverseLeft(model: TreeNodeModel<T>) {
    if (this.targetType === ClrDropTargetType.PARENT) {
      // It should be handled in ClrTreeNode
    } else {
      if (model.parent) {
        this.focusManager.focusNode(model.parent);
        this.targetId = AFTER_PREFIX + model.parent.nodeId;
        this.targetType = ClrDropTargetType.POSITION;
        console.log('right to', this.targetId, this.targetType);
        this.publishDraggableOverRequest();
      }
    }
  }
}

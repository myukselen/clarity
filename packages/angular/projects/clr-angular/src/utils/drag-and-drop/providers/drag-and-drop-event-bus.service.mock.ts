/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Subject } from 'rxjs';

import { DragEventType } from '../interfaces/drag-event.interface';
import { DragAndDropEventBusService } from './drag-and-drop-event-bus.service';

export class MockDragAndDropEventBus {
  private activeDragStartEvent: any;

  public dragStarted: Subject<any> = new Subject<any>();
  public dragHitTested: Subject<any> = new Subject<any>();
  public dragHited: Subject<any> = new Subject<any>();
  public dragHitFinalized: Subject<any> = new Subject<any>();
  public dragMoved: Subject<any> = new Subject<any>();
  public dragEnded: Subject<any> = new Subject<any>();
  public dropped: Subject<any> = new Subject<any>();
  public animation: Subject<any> = new Subject<any>();

  broadcast(event: any): void {
    switch (event.type) {
      case DragEventType.DRAG_START:
        this.activeDragStartEvent = event;
        this.dragStarted.next(event);
        break;
      case DragEventType.DRAG_MOVE:
        this.dragHitTested.next(event);
        this.dragHitFinalized.next(event);
        this.dragMoved.next(event);
        break;
      case DragEventType.DRAG_HIT:
        this.dragHited.next(event);
        break;
      case DragEventType.DRAG_END:
        delete this.activeDragStartEvent;
        this.dragEnded.next(event);
        break;
      case DragEventType.DROP:
        this.dropped.next(event);
        break;
      default:
        break;
    }
  }

  broadcastAnimation(event: any) {
    // right now only done event from tree-node is sent
    this.animation.next(event);
  }

  getActiveDragStartEvent(): any {
    return this.activeDragStartEvent;
  }
}

export const MOCK_DRAG_DROP_EVENT_BUS = {
  provide: DragAndDropEventBusService,
  useClass: MockDragAndDropEventBus,
};

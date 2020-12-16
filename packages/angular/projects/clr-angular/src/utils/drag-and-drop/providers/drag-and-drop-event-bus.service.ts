/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DragEventInterface, DragEventType } from '../interfaces/drag-event.interface';

@Injectable({ providedIn: 'root' })
export class DragAndDropEventBusService<T> {
  private activeDragStartEvent: DragEventInterface<T>;

  private dragStart: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private dragHitTest: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private dragHit: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private dragHitFinalize: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private dragMove: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private dragEnd: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();
  private drop: Subject<DragEventInterface<T>> = new Subject<DragEventInterface<T>>();

  private _animation: Subject<AnimationEvent> = new Subject<AnimationEvent>();

  get dragStarted(): Observable<DragEventInterface<T>> {
    return this.dragStart.asObservable();
  }

  get dragHitTested(): Observable<DragEventInterface<T>> {
    return this.dragHitTest.asObservable();
  }

  get dragHited(): Observable<DragEventInterface<T>> {
    return this.dragHit.asObservable();
  }

  get dragHitFinalized(): Observable<DragEventInterface<T>> {
    return this.dragHitFinalize.asObservable();
  }

  get dragMoved(): Observable<DragEventInterface<T>> {
    return this.dragMove.asObservable();
  }

  get dragEnded(): Observable<DragEventInterface<T>> {
    return this.dragEnd.asObservable();
  }

  get dropped(): Observable<DragEventInterface<T>> {
    return this.drop.asObservable();
  }

  // any naming suggestion? animated?
  get animation(): Observable<AnimationEvent> {
    return this._animation;
  }

  broadcast(event: DragEventInterface<T>): void {
    switch (event.type) {
      case DragEventType.DRAG_START:
        this.activeDragStartEvent = event;
        this.dragStart.next(event);
        break;
      case DragEventType.DRAG_MOVE:
        this.dragHitTest.next(event);
        this.dragHitFinalize.next(event);
        this.dragMove.next(event);
        break;
      case DragEventType.DRAG_HIT:
        this.dragHit.next(event);
        break;
      case DragEventType.DRAG_END:
        delete this.activeDragStartEvent;
        this.dragEnd.next(event);
        break;
      case DragEventType.DROP:
        this.drop.next(event);
        break;
      default:
        break;
    }
  }
  broadcastAnimation(event: AnimationEvent) {
    // right now only done event from tree-node is sent
    this._animation.next(event);
  }

  getActiveDragStartEvent(): DragEventInterface<T> {
    return this.activeDragStartEvent;
  }
}

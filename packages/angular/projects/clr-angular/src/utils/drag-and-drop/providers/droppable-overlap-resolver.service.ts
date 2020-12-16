/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Injectable } from '@angular/core';

import { DragAndDropEventBusService } from './drag-and-drop-event-bus.service';
import { DragEventInterface } from '../interfaces/drag-event.interface';
import { ClrDroppable } from '../droppable/droppable';
import { DragPointPosition } from '../interfaces/drag-event.interface';

interface Vector2D {
  dx: number;
  dy: number;
}

@Injectable({ providedIn: 'root' })
export class DroppableOverlapResolverService<T> {
  // technique to break overlapping region
  // 1) omit droppable on hit phase
  // 2) enable one in finalize phase
  constructor(eventBus: DragAndDropEventBusService<T>) {
    eventBus.dragHited.subscribe(event => this.onDragHit(event));
    eventBus.dragHitFinalized.subscribe(event => this.onDragHitFinalize(event));
    eventBus.dragEnded.subscribe(event => this.onDragEnd(event));
  }

  selectedCenter: DragPointPosition; // others are omitted
  selectedCenterSeen = false;
  droppables: ClrDroppable<T>[] = [];

  previousPosition: DragPointPosition;
  accumulatedMove: Vector2D = { dx: 0, dy: 0 };
  threshold: number;

  onDragHit(event: DragEventInterface<T>): void {
    // collect per droppable info
    this.droppables.push(event.droppable);
    event.droppable.omitFromDragOver = true;
    if (this.selectedCenter && this.selectedCenter === event.droppable.clientCenter) {
      this.selectedCenterSeen = true;
    }
  }

  onDragHitFinalize(event: DragEventInterface<T>): void {
    const currentPosition = event.dropPointPosition;
    // resolution algo:
    if (this.selectedCenter && !this.selectedCenterSeen) {
      this.resetState();
    }
    if (!this.selectedCenter) {
      const newDroppable = this.nearestDroppable(this.droppables, currentPosition);
      if (newDroppable) {
        // select nearest center to current position
        this.selectedCenter = newDroppable.clientCenter;
        // calculate threshold
        this.threshold = 10; // TODO dynamic?
      } else {
        // save for next iteration
        this.saveForNextIteration(currentPosition);
        return;
      }
    }

    // accumulate direction, on direction change reset counter
    if (!this.previousPosition) {
      this.previousPosition = currentPosition; // defaulting to no move
    }
    const currentMove = vectorCalc(this.previousPosition, currentPosition);
    this.accumulatedMove.dx += currentMove.dx;
    this.accumulatedMove.dy += currentMove.dy;
    // need a way to limit accumulation, to easily go back
    if (Math.abs(this.accumulatedMove.dx) > 2 * this.threshold) {
      this.accumulatedMove.dx = Math.sign(this.accumulatedMove.dx) * this.threshold;
    }
    if (Math.abs(this.accumulatedMove.dy) > 2 * this.threshold) {
      this.accumulatedMove.dy = Math.sign(this.accumulatedMove.dy) * this.threshold;
    }

    // if above threshold, try to select nearest according to direction
    let filteredDroppables: ClrDroppable<T>[];
    if (Math.abs(this.accumulatedMove.dx) > this.threshold) {
      // IMPROVE use linear algebra to rotate according to vector and filter 1 quadrant :P
      filteredDroppables = this.droppables.filter(droppable => {
        const px = droppable.clientCenter.pageX - this.selectedCenter.pageX;
        if (sameDirection(px, this.accumulatedMove.dx)) {
          const py = droppable.clientCenter.pageY - this.selectedCenter.pageY;
          if (Math.abs(py) < Math.abs(px)) {
            // laying inside 45 degree;
            return true;
          }
        }
        return false;
      });
    } else if (this.accumulatedMove.dy > this.threshold) {
      filteredDroppables = this.droppables.filter(droppable => {
        const py = droppable.clientCenter.pageY - this.selectedCenter.pageY;
        if (sameDirection(py, this.accumulatedMove.dy)) {
          const px = droppable.clientCenter.pageX - this.selectedCenter.pageX;
          if (Math.abs(px) < Math.abs(py)) {
            // laying inside 45 degree;
            return true;
          }
        }
        return false;
      });
    }
    if (filteredDroppables) {
      const newDroppable = this.nearestDroppable(filteredDroppables, this.selectedCenter);
      if (newDroppable) {
        // on select, reset accumulation
        this.selectedCenter = newDroppable.clientCenter;
        this.accumulatedMove.dx = 0;
        this.accumulatedMove.dy = 0;
      }
    }

    // lift ommision for selectedCenter
    for (const droppable of this.droppables) {
      if (droppable.clientCenter === this.selectedCenter) {
        droppable.omitFromDragOver = false;
        break;
      }
    }

    // save for next iteration
    this.saveForNextIteration(currentPosition);
  }

  saveForNextIteration(currentPosition: DragPointPosition): void {
    this.droppables = [];
    this.previousPosition = currentPosition;
    this.selectedCenterSeen = false;
  }

  resetState(): void {
    // reset to recalculate
    this.selectedCenterSeen = false;
    delete this.selectedCenter;
    delete this.previousPosition;
    this.accumulatedMove = { dx: 0, dy: 0 };
    this.threshold = Number.MAX_VALUE;
  }

  onDragEnd(event: DragEventInterface<T>): void {
    // cleanup everything
    this.droppables = [];
    this.resetState();
  }

  nearestDroppable(droppables: ClrDroppable<T>[], currentPos: DragPointPosition): ClrDroppable<T> {
    if (this.droppables.length === 0) {
      return;
    } else if (this.droppables.length === 1) {
      return this.droppables[0];
    }
    let nearest: ClrDroppable<T>;
    let minDistance = Number.MAX_VALUE;
    droppables.forEach(droppable => {
      const distance = squaredDistance(droppable.clientCenter, currentPos);
      if (distance < minDistance) {
        nearest = droppable;
        minDistance = distance;
      }
    });
    return nearest;
  }
}

function sameDirection(a: number, b: number): boolean {
  // should be greater than 0
  return (a > 0 && b > 0) || (a < 0 && b < 0);
}

function vectorCalc(p1: DragPointPosition, p2: DragPointPosition): Vector2D {
  return {
    dx: p2.pageX - p1.pageX,
    dy: p2.pageY - p1.pageY,
  };
}

function squaredDistance(p1: DragPointPosition, p2: DragPointPosition) {
  const dx = p1.pageX - p2.pageX;
  const dy = p1.pageY - p2.pageY;
  return dx * dx + dy * dy;
}

/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { DragPointPosition, DragEventType } from '../../../utils/drag-and-drop/interfaces/drag-event.interface';
import { ClrDropPositionType } from './drop-position-type.enum';
import { ClrDragEvent } from '../../../utils/drag-and-drop/drag-event';

export class ClrTreeDropEvent<T> {
  public dragPosition: DragPointPosition;
  public group: string | string[];
  public dragDataTransfer: T;
  public dropPointPosition: { pageX: number; pageY: number };
  public type: DragEventType;

  constructor(public dropPosition: ClrDropPositionType, dragEvent: ClrDragEvent<T>) {
    this.dragPosition = dragEvent.dragPosition;
    this.group = dragEvent.group;
    this.dragDataTransfer = dragEvent.dragDataTransfer;
    this.dropPointPosition = dragEvent.dropPointPosition;
    this.type = DragEventType.DROP; // dragEvent.type ? droppable sets but ClrDragEvent does not explicitly defines
  }
}

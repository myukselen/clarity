import { Component, OnInit, Input, ElementRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TreeDndManagerService } from './tree-dnd-manager.service';
import { Subscription } from 'rxjs';
import { ClrDragEvent } from '../../utils/drag-and-drop/drag-event';

const CLASS_DRAGGABLE_OVER = 'draggable-over';
@Component({
  selector: 'clr-drop-position',
  template: ``,
  styles: [':host { display: blocsk; }'],
})
export class ClrDropPositionComponent<T> implements OnInit, OnDestroy {
  constructor(public el: ElementRef, private dndManager: TreeDndManagerService<T>) {}

  @Input() positionId: string;
  @Output('clrDrop') dropEmitter: EventEmitter<ClrDragEvent<T>> = new EventEmitter();

  private _isDraggableOver = false;
  set isDraggableOver(value: boolean) {
    if (value) {
      this.el.nativeElement.classList.add(CLASS_DRAGGABLE_OVER);
      this.el.nativeElement.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
    } else {
      this.el.nativeElement.classList.remove(CLASS_DRAGGABLE_OVER);
    }
    this._isDraggableOver = value;
  }

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    if (!this.positionId) {
      console.log('should generate for root appender');
    }
    this.subscriptions.push(
      this.dndManager.draggableOverRequest.subscribe(positionId => {
        if (positionId === this.positionId) {
          this.isDraggableOver = true;
        } else {
          this.isDraggableOver = false;
        }
      }),
      this.dndManager.dropRequest.subscribe(dropEvent => {
        if (this._isDraggableOver) {
          this.dropEmitter.emit(dropEvent);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

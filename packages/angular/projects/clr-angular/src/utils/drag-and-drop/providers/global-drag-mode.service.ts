/*
 * Copyright (c) 2016-2018 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

// This service class adds and removes the "in-drag" class to the document body element
// through its public enter() and exit() methods.
@Injectable({ providedIn: 'root' }) // TODO provide in ? ClrDragAndDropModule
export class GlobalDragModeService {
  private renderer: Renderer2;
  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null); // see https://github.com/angular/angular/issues/17824#issuecomment-353239017
  }

  enter(): void {
    this.renderer.addClass(document.body, 'in-drag');
  }

  exit(): void {
    this.renderer.removeClass(document.body, 'in-drag');
  }
}

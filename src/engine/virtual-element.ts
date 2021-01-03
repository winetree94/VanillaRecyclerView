import { toPx, DIRECTION, VanillaRecyclerView, Reusable } from './';
import { VanillaRecyclerViewRenderer } from './recycler-view';

export class VirtualElement<T> {
  public parent: VanillaRecyclerView<T>;
  public index = 0;
  public start = 0;
  public size = 0;
  public data: T;

  public wrapperElement: HTMLElement | null = null;
  public renderer: VanillaRecyclerViewRenderer<T> | null = null;

  constructor(parent: VanillaRecyclerView<T>, data: T) {
    this.parent = parent;
    this.data = data;
  }

  public setPosition(start: number, size: number): void {
    this.start = start;
    this.size = size;
  }

  public setIndex(index: number): void {
    this.index = index;
  }

  public updatePosition(): void {
    if (this.wrapperElement) {
      switch (this.parent._direction) {
        case DIRECTION.VERTICAL:
          this.wrapperElement.style.top = toPx(this.start);
          this.wrapperElement.style.height = toPx(this.size);
          break;
        case DIRECTION.HORIZONTAL:
          this.wrapperElement.style.left = toPx(this.start);
          this.wrapperElement.style.width = toPx(this.size);
          break;
      }
    } else {
      throw new Error('element not mounted');
    }
  }

  public isMounted(): boolean {
    return !!this.renderer && !!this.wrapperElement;
  }

  mountRenderer(reusable: Reusable<T>): void {
    if (!this.wrapperElement && !this.renderer) {
      switch (this.parent._direction) {
        case DIRECTION.VERTICAL:
          reusable.wrapperElement.style.top = toPx(this.start);
          reusable.wrapperElement.style.height = toPx(this.size);
          break;
        case DIRECTION.HORIZONTAL:
          reusable.wrapperElement.style.left = toPx(this.start);
          reusable.wrapperElement.style.width = toPx(this.size);
          break;
      }
      this.wrapperElement = reusable.wrapperElement;
      this.renderer = reusable.renderer;
      if (!this.wrapperElement.parentElement) {
        this.parent.container.append(this.wrapperElement);
      }
    } else {
      throw new Error('reusable already mounted');
    }
  }

  unmountRenderer(): Reusable<T> {
    const renderer = this.renderer;
    const wrapperElement = this.wrapperElement;
    if (renderer && wrapperElement) {
      this.renderer = null;
      this.wrapperElement = null;
      if (renderer.onUnmount) {
        renderer.onUnmount({
          api: this.parent,
          data: this.data,
          index: this.index,
        });
      }
      return {
        renderer: renderer,
        wrapperElement: wrapperElement,
      };
    } else {
      throw new Error('renderer not mounted');
    }
  }

  destroyRenderer(): void {
    const reusable = this.unmountRenderer();
    reusable.wrapperElement.parentElement?.removeChild(reusable.wrapperElement);
  }
}

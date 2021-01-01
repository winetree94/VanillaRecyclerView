import { toPx, DIRECTION, RecyclerView, Reusable } from './';
import { RecyclerViewRenderer } from './recycler-view';

export class VirtualElement<T> {
  public parent: RecyclerView<T>;
  public index = 0;
  public start = 0;
  public size = 0;
  public data: T;

  public wrapperElement: HTMLElement | null = null;
  public renderer: RecyclerViewRenderer<T> | null = null;

  constructor(parent: RecyclerView<T>, data: T) {
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

  public updatePosition(direction: DIRECTION): void {
    if (this.wrapperElement) {
      if (direction === DIRECTION.VERTICAL) {
        this.wrapperElement.style.top = toPx(this.start);
        this.wrapperElement.style.height = toPx(this.size);
      } else if (direction === DIRECTION.HORIZONTAL) {
        this.wrapperElement.style.left = toPx(this.start);
        this.wrapperElement.style.width = toPx(this.size);
      }
    } else {
      throw new Error('element not mounted');
    }
  }

  public isMounted(): boolean {
    return !!this.renderer && !!this.wrapperElement;
  }

  mountRenderer(
    direction: DIRECTION,
    element: HTMLElement,
    renderer: RecyclerViewRenderer<T>
  ): void {
    if (!this.renderer && !this.wrapperElement) {
      if (direction === DIRECTION.VERTICAL) {
        element.style.top = toPx(this.start);
        element.style.height = toPx(this.size);
      } else if (direction === DIRECTION.HORIZONTAL) {
        element.style.left = toPx(this.start);
        element.style.width = toPx(this.size);
      }
      this.wrapperElement = element;
      this.renderer = renderer;
    } else {
      throw new Error('renderer already mounted');
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
}

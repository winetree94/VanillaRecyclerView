import { toPx, DIRECTION, RecyclerView, Reusable } from './';
import { RecyclerViewRenderer } from './recycler-view';

export class VirtualElement<T> {
  public parent: RecyclerView<T>;
  public index: number;
  public startSize: number;
  public endSize: number;
  public data: T;

  public wrapperElement: HTMLElement | null = null;
  public renderer: RecyclerViewRenderer<T> | null = null;

  constructor(
    parent: RecyclerView<T>,
    index: number,
    startSize: number,
    endSize: number,
    data: T
  ) {
    this.index = index;
    this.startSize = startSize;
    this.endSize = endSize;
    this.parent = parent;
    this.data = data;
  }

  mountRenderer(element: HTMLElement, renderer: RecyclerViewRenderer<T>): void {
    if (!this.renderer && !this.wrapperElement) {
      if (this.parent.options.direction === DIRECTION.VERTICAL) {
        element.style.top = toPx(this.startSize);
        element.style.height = toPx(this.endSize - this.startSize);
      } else if (this.parent.options.direction === DIRECTION.HORIZONTAL) {
        element.style.left = toPx(this.startSize);
        element.style.width = toPx(this.endSize - this.startSize);
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

import { toPx, DIRECTION, RecyclerView } from './';

export class VirtualElement<T> {
  public parent: RecyclerView<T>;
  public index: number;
  public startSize: number;
  public endSize: number;
  public element: HTMLElement | null = null;
  public data: T;

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

  mount(element: HTMLElement): void {
    if (this.parent.options.direction === DIRECTION.VERTICAL) {
      element.style.top = toPx(this.startSize);
      element.style.height = toPx(this.endSize - this.startSize);
    } else if (this.parent.options.direction === DIRECTION.HORIZONTAL) {
      element.style.left = toPx(this.startSize);
      element.style.width = toPx(this.endSize - this.startSize);
    }
    this.element = element;
  }

  unmount(): HTMLElement {
    const element = this.element;
    this.element = null;
    if (element) {
      return element;
    } else {
      throw new Error('element not mounted');
    }
  }
}

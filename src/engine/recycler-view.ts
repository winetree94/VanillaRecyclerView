/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import '../modules/zoom-listener';
import { parsePx, toPx, VirtualElement } from './';
export const DEFAULT_ITEM_SIZE = 50;

export enum DIRECTION {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export interface Reusable<T> {
  wrapperElement: HTMLElement;
  renderer: VanillaRecyclerViewRenderer<T>;
}

export interface SizeParams<T> {
  api: VanillaRecyclerView<T>;
  data: T;
  index: number;
}

export interface InitializeParams<T> {
  api: VanillaRecyclerView<T>;
  data: T;
  index: number;
}

export interface MountParams<T> {
  api: VanillaRecyclerView<T>;
  data: T;
  index: number;
}

export interface UnmountParams<T> {
  api: VanillaRecyclerView<T>;
  data: T;
  index: number;
}

export interface VanillaRecyclerViewRenderer<T> {
  initialize: (params: InitializeParams<T>) => void;
  getLayout: () => HTMLElement;
  onMount?: (params: MountParams<T>) => boolean;
  onUnmount?: (params: UnmountParams<T>) => void;
}

export interface RendererConstructor<T> {
  new (): VanillaRecyclerViewRenderer<T>;
}

export interface VanillaRecyclerViewOptions<T> {
  data: T[];
  direction?: DIRECTION;
  preload?: number;
  size?: ((params: SizeParams<T>) => number) | number;
  renderer: RendererConstructor<T>;
}

export interface VanillaRecyclerViewAPI<T> {
  calculateSize: () => void;
  getMaxScrollSize: () => number;
  splice: (start: number, end?: number) => void;
  insert: (index: number, ...data: T[]) => void;
  push: (...items: T[]) => void;
}

export class VanillaRecyclerView<T> implements VanillaRecyclerViewAPI<T> {
  /* constants */
  private root: HTMLDivElement;

  public _direction: DIRECTION;
  public _preload: number;
  public _size: ((params: SizeParams<T>) => number) | number;
  public _renderer: RendererConstructor<T>;

  /* virtual scroll area element */
  public container: HTMLDivElement;

  /* all virtual elements */
  public virtualElements: VirtualElement<T>[] = [];
  /* current mounted virtual elements */
  public mountedVirtualElements: VirtualElement<T>[] = [];
  /* pending unmount */
  public pendingUnmount: VirtualElement<T>[] = [];
  /* unmounted, reusable elements */
  public reusables: Reusable<T>[] = [];

  public constructor(
    root: HTMLDivElement,
    options: VanillaRecyclerViewOptions<T>
  ) {
    /* allocate arguments */
    this.root = root;

    /* define default direction */
    if (options.direction) {
      this._direction = options.direction;
    } else {
      this._direction = DIRECTION.VERTICAL;
    }

    /* define default preload */
    if (options.preload) {
      this._preload = options.preload;
    } else {
      this._preload = DEFAULT_ITEM_SIZE;
    }

    /* define default size */
    if (options.size) {
      this._size = options.size;
    } else {
      this._size = DEFAULT_ITEM_SIZE;
    }

    /* allocate renderer */
    this._renderer = options.renderer;

    /* apply class to element */
    this.root.classList.add('recycler_view_root');
    if (this._direction === DIRECTION.VERTICAL) {
      this.root.classList.add(DIRECTION.VERTICAL);
    } else if (this._direction === DIRECTION.HORIZONTAL) {
      this.root.classList.add(DIRECTION.HORIZONTAL);
    }

    /* create wrapper element for scroll area */
    this.container = document.createElement('div');
    this.container.classList.add('recycler_view_container');

    /* create virtual element per data */
    this.setData(options.data);

    /* append element */
    this.root.append(this.container);

    // bind scroll, zoom event
    this.root.addEventListener('scroll', this.onScroll.bind(this));
    document.body.addEventListener('zoom', this.onScroll.bind(this));
    // emit event for first render
    this.root.dispatchEvent(new Event('scroll'));
  }

  private onScroll(): void {
    const { scrollTop, scrollLeft } = this.root;
    const {
      height: screenHeight,
      width: screenWidth,
    } = this.root.getBoundingClientRect();

    const max = this.getMaxScrollSize();
    const maxScrollSize =
      max > this.root.clientHeight ? max : this.root.clientHeight;
    let currentScrollSize = 0;
    let startSize = 0;
    let endSize = 0;

    /* calculate direction */
    switch (this._direction) {
      case DIRECTION.VERTICAL:
        currentScrollSize = scrollTop + screenHeight;
        startSize = scrollTop - this._preload;
        endSize = scrollTop + screenHeight + this._preload;
        break;
      case DIRECTION.HORIZONTAL:
        currentScrollSize = scrollLeft + screenWidth;
        startSize = scrollLeft - this._preload;
        endSize = scrollLeft + screenWidth + this._preload;
        break;
    }

    if (currentScrollSize > maxScrollSize) {
      switch (this._direction) {
        case DIRECTION.VERTICAL:
          this.root.scrollTop = maxScrollSize - screenHeight;
          break;
        case DIRECTION.HORIZONTAL:
          this.root.scrollLeft = maxScrollSize - screenWidth;
          break;
      }
      this.onScroll();
      return;
    }

    /**
     * todo
     * use map to save some performance
     */
    const shouldMount = this.virtualElements.filter((virtualDom) => {
      return (
        virtualDom.start >= startSize &&
        virtualDom.start + virtualDom.size <= endSize
      );
    });

    const mounted: VirtualElement<T>[] = [];
    const toMount: VirtualElement<T>[] = [];

    shouldMount.forEach((virtualDom) => {
      if (!this.mountedVirtualElements.includes(virtualDom)) {
        toMount.push(virtualDom);
      } else {
        mounted.push(virtualDom);
      }
    });

    const toUnmount = this.pendingUnmount.concat(
      this.mountedVirtualElements.filter(
        (virtualDom) => !shouldMount.includes(virtualDom)
      )
    );

    /**
     * unmount and save reusable dom
     */
    toUnmount.forEach((virtualDom) => {
      if (virtualDom.isMounted()) {
        const reusable = virtualDom.unmountRenderer();
        this.reusables.push(reusable);
      }
    });

    /**
     * mount
     */
    toMount.forEach((virtualDom) => {
      const reusable: Reusable<T> = (() => {
        const reusable = this.getNextReusable();

        const refreshed =
          reusable &&
          reusable.renderer.onMount &&
          reusable.renderer.onMount({
            api: this,
            data: virtualDom.data,
            index: virtualDom.index,
          });

        if (reusable && refreshed) {
          return reusable;
        } else {
          reusable?.wrapperElement.parentElement?.removeChild(
            reusable.wrapperElement
          );
          return this.createReusable(virtualDom);
        }
      })();

      virtualDom.mountRenderer(reusable);
    });

    /**
     * update mounted renderer position
     */
    mounted.forEach((virtualDom) => {
      virtualDom.updatePosition();
    });

    /**
     * remove overflowed reusables
     */
    this.reusables.forEach((reusable) => {
      let start = 0;
      switch (this._direction) {
        case DIRECTION.VERTICAL:
          start = parsePx(reusable.wrapperElement.style.top) + screenHeight;
          break;
        case DIRECTION.HORIZONTAL:
          start = parsePx(reusable.wrapperElement.style.left) + screenWidth;
          break;
      }
      if (start > maxScrollSize) {
        reusable.wrapperElement.parentElement?.removeChild(
          reusable.wrapperElement
        );
      }
    });

    this.pendingUnmount = [];
    this.mountedVirtualElements = shouldMount;
  }

  /**
   * parse size option
   * @param data
   */
  private getSize(index: number, data: T): number {
    if (typeof this._size === 'function') {
      return this._size({ api: this, data: data, index: index });
    } else {
      return this._size;
    }
  }

  private createReusable(virtualElement: VirtualElement<T>): Reusable<T> {
    const container = document.createElement('div');
    container.classList.add('recycler_view_item');
    const renderer = new this._renderer();

    renderer.initialize({
      api: this,
      data: virtualElement.data,
      index: virtualElement.index,
    });

    const element = renderer.getLayout();
    container.append(element);

    return {
      wrapperElement: container,
      renderer: renderer,
    };
  }

  private getNextReusable(): Reusable<T> | null {
    if (this.reusables) {
      return this.reusables.splice(0, 1)[0];
    } else {
      return null;
    }
  }

  public setData(data: T[]): void {
    this.reusables = [];
    this.pendingUnmount = this.virtualElements.slice();
    this.virtualElements = [];
    this.calculateSize();
    this.onScroll();
    this.virtualElements = data.map(
      (data) => new VirtualElement<T>(this, data)
    );
    this.calculateSize();
    this.onScroll();
  }

  public calculateSize(): void {
    const viewSize = this.virtualElements.reduce((start, virtualDom, index) => {
      const currentSize = this.getSize(index, virtualDom.data);
      virtualDom.setIndex(index);
      virtualDom.setPosition(start, currentSize);
      return start + currentSize;
    }, 0);
    switch (this._direction) {
      case DIRECTION.VERTICAL:
        this.container.style.height = toPx(viewSize);
        break;
      case DIRECTION.HORIZONTAL:
        this.container.style.width = toPx(viewSize);
        break;
      default:
        throw new Error('not supported direction');
    }
  }

  public getMaxScrollSize(): number {
    switch (this._direction) {
      case DIRECTION.VERTICAL:
        return parsePx(this.container.style.height);
      case DIRECTION.HORIZONTAL:
        return parsePx(this.container.style.width);
    }
  }

  public splice(start: number, end?: number): void {
    if (end === undefined) {
      this.pendingUnmount = this.virtualElements.splice(start);
    } else {
      this.pendingUnmount = this.virtualElements.splice(start, end);
    }
    this.calculateSize();
    this.onScroll();
  }

  public insert(index: number, ...data: T[]): void {
    const prefix = this.virtualElements.slice(0, index);
    const surfix = this.virtualElements.slice(index);
    const virtualElements = data.map(
      (data) => new VirtualElement<T>(this, data)
    );
    this.virtualElements = [...prefix, ...virtualElements, ...surfix];
    this.calculateSize();
    this.onScroll();
  }

  public push(...items: T[]): void {
    const virtualElements = items.map(
      (item) => new VirtualElement<T>(this, item)
    );
    this.virtualElements.push(...virtualElements);
    this.calculateSize();
    this.onScroll();
  }
}

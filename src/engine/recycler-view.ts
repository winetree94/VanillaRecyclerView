/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import '../modules/zoom-listener';
import { toPx, VirtualElement } from './';
export const DEFAULT_ITEM_SIZE = 50;

export enum DIRECTION {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

export interface Reusable<T> {
  wrapperElement: HTMLElement;
  renderer: RecyclerViewRenderer<T>;
}

export interface SizeParams<T> {
  api: RecyclerView<T>;
  data: T;
}

export interface InitializeParams<T> {
  api: RecyclerView<T>;
  data: T;
  index: number;
}

export interface MountParams<T> {
  api: RecyclerView<T>;
  data: T;
  index: number;
}

export interface UnmountParams<T> {
  api: RecyclerView<T>;
  data: T;
  index: number;
}

export interface RecyclerViewRenderer<T> {
  initialize: (params: InitializeParams<T>) => void;
  getLayout: () => HTMLElement;
  onMount?: (params: MountParams<T>) => boolean;
  onUnmount?: (params: UnmountParams<T>) => void;
}

export interface RendererConstructor<T> {
  new (): RecyclerViewRenderer<T>;
}

export interface RecyclerViewOptions<T> {
  data: T[];
  direction?: DIRECTION;
  preload?: number;
  size?: ((params: SizeParams<T>) => number) | number;
  renderer: RendererConstructor<T>;
}

export class RecyclerView<T> {
  /* constants */
  private root: HTMLDivElement;

  private _direction: DIRECTION;
  private _preload: number;
  private _size: ((params: SizeParams<T>) => number) | number;
  private _renderer: RendererConstructor<T>;

  /* virtual scroll area element */
  private container: HTMLDivElement;

  /* all virtual elements */
  private virtualElements: VirtualElement<T>[] = [];
  /* current mounted virtual elements */
  private mountedVirtualElements: VirtualElement<T>[] = [];
  /* unmounted, reusable elements */
  private reusables: Reusable<T>[] = [];

  public constructor(root: HTMLDivElement, options: RecyclerViewOptions<T>) {
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

    let startSize = scrollTop;
    let endSize = scrollTop + screenHeight;

    /* calculate direction */
    switch (this._direction) {
      case DIRECTION.VERTICAL:
        startSize = scrollTop - this._preload;
        endSize = scrollTop + screenHeight + this._preload;
        break;
      case DIRECTION.HORIZONTAL:
        startSize = scrollLeft - this._preload;
        endSize = scrollLeft + screenWidth + this._preload;
        break;
    }

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

    const toUnmount = this.mountedVirtualElements.filter(
      (virtualDom) => !shouldMount.includes(virtualDom)
    );

    /**
     * unmount and save reusable dom
     */
    toUnmount.forEach((virtualDom) => {
      const reusable = virtualDom.unmountRenderer();
      this.reusables.push(reusable);
    });

    toMount.forEach((virtualDom) => {
      const reusable = this.getNextReusable();
      if (reusable && reusable.renderer.onMount) {
        const refreshed = reusable.renderer.onMount({
          api: this,
          data: virtualDom.data,
          index: virtualDom.index,
        });
        if (refreshed) {
          virtualDom.mountRenderer(
            this._direction,
            reusable.wrapperElement,
            reusable.renderer
          );
        } else {
          reusable.wrapperElement.parentElement?.removeChild(
            reusable.wrapperElement
          );
          const createdReusable = this.createReusable(virtualDom);
          virtualDom.mountRenderer(
            this._direction,
            createdReusable.wrapperElement,
            createdReusable.renderer
          );
          this.container.append(createdReusable.wrapperElement);
        }
      } else if (reusable) {
        reusable.wrapperElement.parentElement?.removeChild(
          reusable.wrapperElement
        );
        const createdReusable = this.createReusable(virtualDom);
        virtualDom.mountRenderer(
          this._direction,
          createdReusable.wrapperElement,
          createdReusable.renderer
        );
        this.container.append(createdReusable.wrapperElement);
      } else {
        const createdReusable = this.createReusable(virtualDom);
        virtualDom.mountRenderer(
          this._direction,
          createdReusable.wrapperElement,
          createdReusable.renderer
        );
        this.container.append(createdReusable.wrapperElement);
      }
    });

    mounted.forEach((virtualDom) => {
      virtualDom.updatePosition(this._direction);
    });

    this.mountedVirtualElements = shouldMount;
  }

  /**
   * parse size option
   * @param data
   */
  private getSize(data: T): number {
    if (typeof this._size === 'function') {
      return this._size({ api: this, data: data });
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

  public calcalateSize(): void {
    const viewSize = this.virtualElements.reduce((start, virtualDom, index) => {
      const currentSize = this.getSize(virtualDom.data);
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

  private setData(data: T[]): void {
    this.virtualElements = data.map(
      (data) => new VirtualElement<T>(this, data)
    );
    this.calcalateSize();
    this.onScroll();
  }
}

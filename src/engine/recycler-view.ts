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

export interface RowHeightParams<T> {
  api: RecyclerView<T>;
  data: T;
}

export interface LayoutParams<T> {
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
  initialize: (params: LayoutParams<T>) => void;
  getLayout: () => HTMLElement;
  onMount?: (params: MountParams<T>) => boolean;
  onUnmount?: (params: UnmountParams<T>) => void;
}

export interface ClassRenderer<T> {
  new (): RecyclerViewRenderer<T>;
}

export type RendererType<T> = ClassRenderer<T>;

export function isClassRenderer<T>(
  renderer: RendererType<T>
): renderer is ClassRenderer<T> {
  return (
    typeof renderer === 'function' &&
    renderer.prototype &&
    renderer.prototype.layout
  );
}

export interface RecyclerViewOptions<T> {
  data: T[];
  direction?: DIRECTION;
  preload?: number;
  size?: ((params: RowHeightParams<T>) => number) | number;
  renderer: RendererType<T>;
}

export class RecyclerView<T> {
  /* constant */
  public root: HTMLDivElement;
  public container: HTMLDivElement;

  /* options */
  public options: RecyclerViewOptions<T>;

  public virtualDoms: VirtualElement<T>[] = [];
  public mountedVirtualElements: VirtualElement<T>[] = [];
  public reusableDoms: HTMLElement[] = [];

  public reusables: Reusable<T>[] = [];

  constructor(parent: HTMLDivElement, options: RecyclerViewOptions<T>) {
    /* 기초 데이터 등록 */
    this.root = parent;
    this.options = options;

    /* 기본 방향 지정 */
    if (!this.options.direction) {
      this.options.direction = DIRECTION.VERTICAL;
    }

    /* 루트 컨테이너에 클래스 반영 */
    this.root.classList.add('recycler_view_root');
    if (this.options.direction === DIRECTION.VERTICAL) {
      this.root.classList.add(DIRECTION.VERTICAL);
    } else if (this.options.direction === DIRECTION.HORIZONTAL) {
      this.root.classList.add(DIRECTION.HORIZONTAL);
    }

    if (!this.options.preload) {
      this.options.preload = DEFAULT_ITEM_SIZE;
    }

    this.container = document.createElement('div');
    this.container.classList.add('recycler_view_container');

    this.initializeSize();

    this.root.append(this.container);

    this.root.addEventListener('scroll', this.onScroll.bind(this));
    document.body.addEventListener('zoom', this.onScroll.bind(this));
    this.root.dispatchEvent(new Event('scroll'));
  }

  onScroll(): void {
    const { scrollTop, scrollLeft } = this.root;
    const {
      height: screenHeight,
      width: screenWidth,
    } = this.root.getBoundingClientRect();

    let startSize = scrollTop;
    let endSize = scrollTop + screenHeight;

    /* calculate direction */
    switch (this.options.direction) {
      case DIRECTION.VERTICAL:
        startSize = scrollTop - (this.options.preload || DEFAULT_ITEM_SIZE);
        endSize =
          scrollTop +
          screenHeight +
          (this.options.preload || DEFAULT_ITEM_SIZE);
        break;
      case DIRECTION.HORIZONTAL:
        startSize = scrollLeft - (this.options.preload || DEFAULT_ITEM_SIZE);
        endSize =
          scrollLeft +
          screenWidth +
          (this.options.preload || DEFAULT_ITEM_SIZE);
        break;
    }

    const shouldMount = this.virtualDoms.filter((virtualDom) => {
      return virtualDom.startSize >= startSize && virtualDom.endSize <= endSize;
    });

    const toMount = shouldMount.filter(
      (virtualDom) => !this.mountedVirtualElements.includes(virtualDom)
    );

    const toUnmount = this.mountedVirtualElements.filter(
      (virtualDom) => !shouldMount.includes(virtualDom)
    );

    /**
     * unmount
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
          virtualDom.mountRenderer(reusable.wrapperElement, reusable.renderer);
        } else {
          reusable.wrapperElement.parentElement?.removeChild(
            reusable.wrapperElement
          );
          const createdReusable = this.createReusable(virtualDom);
          virtualDom.mountRenderer(
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
          createdReusable.wrapperElement,
          createdReusable.renderer
        );
        this.container.append(createdReusable.wrapperElement);
      } else {
        const createdReusable = this.createReusable(virtualDom);
        virtualDom.mountRenderer(
          createdReusable.wrapperElement,
          createdReusable.renderer
        );
        this.container.append(createdReusable.wrapperElement);
      }
    });

    this.mountedVirtualElements = shouldMount;
  }

  /**
   * initialize or recalculate item size
   */
  initializeSize(): void {
    let lastViewSize = 0;

    this.options.data.forEach((data: T, index: number) => {
      const currentViewSize = lastViewSize;
      const virtualDomSize = this.getSize(data);
      lastViewSize += virtualDomSize;
      this.virtualDoms.push(
        new VirtualElement<T>(
          this,
          index,
          currentViewSize,
          currentViewSize + virtualDomSize,
          data
        )
      );
    });

    switch (this.options.direction) {
      case DIRECTION.VERTICAL:
        this.container.style.height = toPx(lastViewSize);
        break;
      case DIRECTION.HORIZONTAL:
        this.container.style.width = toPx(lastViewSize);
        break;
      default:
        throw new Error('not supported direction');
    }
  }

  /**
   * parse size option
   * @param data
   */
  getSize(data: T): number {
    if (!this.options.size) {
      return DEFAULT_ITEM_SIZE;
    } else if (typeof this.options.size === 'function') {
      return this.options.size({ api: this, data: data });
    } else {
      return this.options.size;
    }
  }

  /**
   * get unused renderer
   */
  getNextRecyclableDom(): HTMLElement | null {
    if (this.reusableDoms.length) {
      return this.reusableDoms.splice(0, 1)[0];
    } else {
      return null;
    }
  }

  createReusable(virtualElement: VirtualElement<T>): Reusable<T> {
    console.log('create');
    const container = document.createElement('div');
    container.classList.add('recycler_view_item');
    const renderer = new this.options.renderer();

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

  getNextReusable(): Reusable<T> | null {
    if (this.reusables) {
      return this.reusables.splice(0, 1)[0];
    } else {
      return null;
    }
  }

  clearReusables(): void {
    this.reusables.forEach(({ wrapperElement }) => {
      wrapperElement.parentElement?.removeChild(wrapperElement);
    });
    this.reusables = [];
  }
}

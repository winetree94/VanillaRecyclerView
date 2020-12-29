import { DEFAULT_ITEM_SIZE } from '../setting/constant';
import { toPx } from './parser';

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

export enum DIRECTION {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
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
  element: HTMLElement;
}

export interface UnmountParams<T> {
  api: RecyclerView<T>;
  data: T;
  index: number;
  element: HTMLElement;
}

export interface RecyclerViewOptions<T> {
  data: T[];
  direction?: DIRECTION;
  preload?: number;
  size?: ((params: RowHeightParams<T>) => number) | number;
  layout: (params: LayoutParams<T>) => HTMLElement | string;
  mount?: (params: MountParams<T>) => boolean;
  unmount?: (params: UnmountParams<T>) => void;
}

export class RecyclerView<T> {
  /* constant */
  public root: HTMLDivElement;
  public container: HTMLDivElement;

  /* options */
  public options: RecyclerViewOptions<T>;
  public layout = 0;

  public virtualDoms: VirtualElement<T>[] = [];
  public mountedVirtualRenderer: VirtualElement<T>[] = [];
  public reusableDoms: HTMLElement[] = [];

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

    /* 기본 미리로딩 개수 지정 */
    if (!this.options.preload) {
      this.options.preload = DEFAULT_ITEM_SIZE;
    }

    /* 맵을 담을 dom 생성 */
    this.container = document.createElement('div');
    this.container.classList.add('recycler_view_container');

    /* 스크롤 영역을 생성한다 */
    this.initializeSize();

    /* 화면에 표시 */
    this.root.append(this.container);

    /* 이벤트 활성화 */
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
      (virtualDom) => !this.mountedVirtualRenderer.includes(virtualDom)
    );

    const toUnmount = this.mountedVirtualRenderer.filter(
      (virtualDom) => !shouldMount.includes(virtualDom)
    );

    /**
     * unmount
     */
    toUnmount.forEach((virtualDom) => {
      const unmountedElement = virtualDom.unmount();
      if (this.options.unmount) {
        this.options.unmount({
          api: this,
          data: virtualDom.data,
          index: virtualDom.index,
          element: unmountedElement,
        });
      }
      if (!this.options.mount) {
        unmountedElement.parentElement?.removeChild(unmountedElement);
      }
      this.reusableDoms.push(unmountedElement);
    });

    toMount.forEach((virtualDom) => {
      const reusableDom = this.getNextRecyclableDom();

      if (reusableDom && this.options.mount) {
        const refreshed = this.options.mount({
          api: this,
          data: virtualDom.data,
          index: virtualDom.index,
          element: reusableDom,
        });
        if (refreshed) {
          virtualDom.mount(reusableDom);
        } else {
          const layout = this.getLayout(virtualDom.data, virtualDom.index);
          virtualDom.mount(layout);
          this.container.append(layout);
        }
      } else {
        const layout = this.getLayout(virtualDom.data, virtualDom.index);
        virtualDom.mount(layout);
        this.container.append(layout);
      }
    });

    this.mountedVirtualRenderer = shouldMount;
  }

  /**
   * initialize or recalculate item size
   */
  initializeSize(): void {
    let lastViewSize = 0;
    this.virtualDoms.push(
      ...this.options.data.map((data: T, index: number) => {
        const currentViewSize = lastViewSize;
        const virtualDomSize = this.getSize(data);
        lastViewSize += virtualDomSize;
        return new VirtualElement<T>(
          this,
          index,
          currentViewSize,
          currentViewSize + virtualDomSize,
          data
        );
      })
    );
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
   * parse layout option
   * @param data
   */
  getLayout(data: T, index: number): HTMLElement {
    const container = document.createElement('div');
    container.classList.add('recycler_view_item');

    const element = this.options.layout({
      api: this,
      data: data,
      index: index,
    });

    if (element instanceof Node) {
      container.append(element);
    } else {
      container.innerHTML = element;
    }

    return container;
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
}

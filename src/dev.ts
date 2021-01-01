import {
  DIRECTION,
  RecyclerView,
  RecyclerViewRenderer,
  RecyclerViewOptions,
  InitializeParams,
  MountParams,
  UnmountParams,
} from './engine';
import './styles.scss';

export interface D {
  a: number;
  b: number;
  index: number;
  someValue: string;
  _event?: (e: Event) => void;
}

const root1 = document.getElementById('root1') as HTMLDivElement;

if (root1) {
  root1.style.height = '500px';

  const rowNumberToCreate = 10;

  const options: RecyclerViewOptions<D> = {
    preload: 100,
    data: Array.from(new Array(rowNumberToCreate)).map((a, index) => ({
      a: Math.random(),
      b: Math.random(),
      index: index,
      someValue: '',
    })),
    size: (params) => (params.data.a ? params.data.a * 100 : 100),
    renderer: class implements RecyclerViewRenderer<D> {
      public layout?: HTMLElement;

      initialize(params: InitializeParams<D>) {
        this.layout = document.createElement('div');
        this.layout.innerHTML = `${params.data.index}`;
      }

      getLayout() {
        return this.layout as HTMLElement;
      }

      onMount(params: MountParams<D>) {
        if (this.layout) {
          this.layout.innerHTML = `${params.data.index}`;
        }
        return true;
      }

      onUnmount(params: UnmountParams<D>) {
        return;
      }
    },
  };

  const instance = new RecyclerView(root1, options);

  instance.insert(0, [
    {
      a: Math.random(),
      b: Math.random(),
      index: 555,
      someValue: '',
    },
  ]);

  instance.remove(0);
  instance.remove(0);
  instance.remove(0);
  instance.remove(0);
  instance.remove(0);
  instance.remove(0);
}

const root2 = document.getElementById('root2') as HTMLDivElement;

if (root2) {
  root2.style.height = '500px';
  root2.style.width = '100%';

  const rowNumberToCreate = Math.floor(Math.random() * 100000);

  const options: RecyclerViewOptions<D> = {
    preload: 200,
    direction: DIRECTION.HORIZONTAL,
    data: Array.from(new Array(rowNumberToCreate)).map((a, index) => ({
      a: Math.random(),
      b: Math.random(),
      index: index,
      someValue: '',
    })),
    size: (params) => (params.data.a ? params.data.a * 100 : 100),
    renderer: class implements RecyclerViewRenderer<D> {
      public layout?: HTMLElement;

      initialize(params: InitializeParams<D>) {
        this.layout = document.createElement('div');
        this.layout.innerHTML = `${params.index}`;
      }

      getLayout() {
        return this.layout as HTMLElement;
      }
    },
  };

  new RecyclerView(root2, options);
}

import './engine';
import { DIRECTION, RecyclerView, RecyclerViewOptions } from './engine';
import './styles.scss';

export interface D {
  a: number;
  b: number;
  index: number;
}

const root1 = document.getElementById('root1') as HTMLDivElement;

if (root1) {
  root1.style.height = '500px';

  const rowNumberToCreate = 100000;

  const options: RecyclerViewOptions<D> = {
    preload: 50,
    data: Array.from(new Array(rowNumberToCreate)).map((a, index) => ({
      a: Math.random(),
      b: Math.random(),
      index: index,
    })),
    size: (params) => (params.data.a ? params.data.a * 100 : 100),
    layout: (params) => {
      return `
        ${params.index}
      `;
    },
    mount: (params) => {
      params.element.innerHTML = params.index.toString();
      return true;
    },
  };

  new RecyclerView(root1, options);
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
    })),
    size: (params) => (params.data.a ? params.data.a * 100 : 100),
    layout: (params) => {
      return `
        ${params.index}
      `;
    },
    mount: (params) => {
      params.element.innerHTML = params.index.toString();
      return true;
    },
  };

  new RecyclerView(root2, options);
}

import { DIRECTION, RecyclerView, RecyclerViewOptions } from './engine';
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

  const rowNumberToCreate = 300000;

  const options: RecyclerViewOptions<D> = {
    preload: 50,
    data: Array.from(new Array(rowNumberToCreate)).map((a, index) => ({
      a: Math.random(),
      b: Math.random(),
      index: index,
      someValue: '',
    })),
    size: (params) => (params.data.a ? params.data.a * 100 : 100),
    layout: (params) => {
      const element = document.createElement('div');
      element.innerHTML = `
        <input type="text" value=${params.data.someValue} >
      `;
      const input = element.querySelector('input') as HTMLInputElement;
      input.addEventListener('input', (e: Event) => {
        params.data.someValue = (<HTMLInputElement>e.target).value;
      });
      return element;
    },
    mount: (params) => {
      console.log('mount');
      // const input = params.element.querySelector('input') as HTMLInputElement;
      // input.value = params.data.someValue;
      // input.addEventListener('input', (e: Event) => {
      //   params.data.someValue = (<HTMLInputElement>e.target).value;
      // });
      return false;
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
      someValue: '',
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

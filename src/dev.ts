/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  DIRECTION,
  VanillaRecyclerView,
  VanillaRecyclerViewOptions,
  InitializeParams,
  MountParams,
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

/**
 * Data model interface
 */
interface Person {
  name: string;
  age: number;
  hobbies: string[];
}

/**
 * create 50,000 data
 */
function createData(count: number): Person[] {
  const result: Person[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      name: Math.random().toString(36).substring(7),
      age: Math.floor(Math.random() * Math.floor(30)),
      hobbies: Array.from(
        new Array(Math.floor(Math.random() * Math.floor(5)))
      ).map(() => Math.random().toString(36).substring(7)),
    });
  }
  return result;
}

if (root1) {
  root1.style.height = '400px';
  root1.style.width = '100%';

  const data: Person[] = createData(10);

  /**
   * use option interface
   */
  const options: VanillaRecyclerViewOptions<Person> = {
    direction: DIRECTION.VERTICAL,
    data: data,
    preload: 200,
    /**
     * Dynamic row size
     */
    size: (params) => {
      return 85 + params.data.hobbies.length * 25;
    },
    renderer: class {
      public $layout: HTMLElement;
      public $index: HTMLInputElement;
      public $name: HTMLInputElement;
      public $nameListener: any;
      public $age: HTMLInputElement;
      public $ageListener: any;
      public $hobbies: HTMLElement;

      initialize(params: InitializeParams<Person>) {
        this.$layout = document.createElement('div');
        this.$layout.style.width = '100%';
        this.$layout.innerHTML = `
        <table>
          <tr>
            <td>
              index : 
            </td>
            <td class="index">
              ${params.index + 1}
            </td>
          </tr>
          <tr>
            <td>
              name : 
            </td>
            <td>
              <input class="name" value="${params.data.name}">
            </td>
          </tr>
          <tr>
            <td>
              age :
            </td>
            <td>
              <input class="age" value="${params.data.age}">
            </td>
          </tr>
          <tr>
            <td colspan="2" class="hobbies">
              ${params.data.hobbies
                .map(
                  (hobby, index) => `
                    <div>hobby ${index + 1}: ${hobby}</div>
                  `
                )
                .join('')}
            </td>
          </tr>
        </table>
      `;

        // allocate dom object
        this.$index = this.$layout.querySelector('.index');
        this.$name = this.$layout.querySelector('.name');
        this.$age = this.$layout.querySelector('.age');
        this.$hobbies = this.$layout.querySelector('.hobbies');

        // create event listener
        this.$nameListener = (e: Event) =>
          (params.data.name = (e.target as HTMLInputElement).value);
        this.$ageListener = (e: Event) =>
          (params.data.age = parseInt((e.target as HTMLInputElement).value));

        // bind event listener
        this.$name.addEventListener('input', this.$nameListener);
        this.$age.addEventListener('input', this.$ageListener);
      }
      getLayout() {
        return this.$layout;
      }
      onMount(params: MountParams<Person>) {
        /* replace dom content */
        this.$index.innerHTML = `${params.index}`;
        this.$name.value = params.data.name;
        this.$age.value = `${params.data.age}`;
        this.$hobbies.innerHTML = params.data.hobbies
          .map(
            (hobby, index) => `
            <div>hobby ${index + 1}: ${hobby}</div>
          `
          )
          .join('');

        // create new event listener
        this.$nameListener = (e: Event) =>
          (params.data.name = (e.target as HTMLInputElement).value);
        this.$ageListener = (e: Event) =>
          (params.data.age = parseInt((e.target as HTMLInputElement).value));

        // bind new event listener
        this.$name.addEventListener('input', this.$nameListener);
        this.$age.addEventListener('input', this.$ageListener);

        return true;
      }

      onUnmount() {
        // unbind old event listener
        this.$name.removeEventListener('input', this.$nameListener);
        this.$age.removeEventListener('input', this.$ageListener);
        // blur input
        this.$name.blur();
        this.$age.blur();
      }
    },
  };

  /**
   * initialize RecyclerView
   */
  const instance = new VanillaRecyclerView<Person>(root1, options);

  root1.addEventListener('scroll', () => {
    if (root1.scrollTop + root1.clientHeight > root1.scrollHeight - 100) {
      const data: Person[] = createData(1);
      instance.push(...data);
      console.log('added');
    }
  });
}

// const root2 = document.getElementById('root2') as HTMLDivElement;

// if (root2) {
//   root2.style.height = '500px';
//   root2.style.width = '100%';

//   const rowNumberToCreate = Math.floor(Math.random() * 100000);

//   const options: VanillaRecyclerViewOptions<D> = {
//     preload: 200,
//     direction: DIRECTION.HORIZONTAL,
//     data: Array.from(new Array(rowNumberToCreate)).map((a, index) => ({
//       a: Math.random(),
//       b: Math.random(),
//       index: index,
//       someValue: '',
//     })),
//     size: (params) => (params.data.a ? params.data.a * 100 : 100),
//     renderer: class implements VanillaRecyclerViewRenderer<D> {
//       public layout?: HTMLElement;

//       initialize(params: InitializeParams<D>) {
//         this.layout = document.createElement('div');
//         this.layout.innerHTML = `${params.index}`;
//       }

//       getLayout() {
//         return this.layout as HTMLElement;
//       }
//     },
//   };

//   new VanillaRecyclerView(root2, options);
// }

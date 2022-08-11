import './button.css';
import { InitializeParams, VanillaRecyclerView, VanillaRecyclerViewRenderer } from '../src/index';

export interface ButtonProps { }

function makeid(
  len: number,
): string[] {
  const result: string[] = [];
  for (let i = 0; i < len; i++) {
    const str = (Math.random() + 1).toString(36).substring(7);
    result.push(str);
  }
  return result;
}

/**
 * Primary UI component for user interaction
 */
export const createButton = ({}: ButtonProps) => {
  const div = document.createElement('div');
  div.style.height = `100vh`;
  div.style.width = `100%`;
  div.style.overflow = 'auto';

  const recyclerView = new VanillaRecyclerView(div, {
    data: makeid(500),
    size: 50,
    renderer: class Renderer implements VanillaRecyclerViewRenderer<string> {

      public key: string;
      public element: HTMLElement;

      constructor(key: string) {
        this.key = key;
      }

      initialize(params: InitializeParams<string>): void {
        this.element = document.createElement('div');
        this.element.textContent = params.data;
      }

      getLayout(): HTMLElement {
        return this.element;
      }

    }
  });

  recyclerView.setData(makeid(500));

  return div;
};

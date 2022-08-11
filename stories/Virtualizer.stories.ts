import { Story, Meta } from '@storybook/html';
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

// More on default export: https://storybook.js.org/docs/html/writing-stories/introduction#default-export
export default {
  title: 'Virtualizer/Basic',
  // More on argTypes: https://storybook.js.org/docs/html/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
    label: { control: 'text' },
    onClick: { action: 'onClick' },
    primary: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
} as Meta;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: Story<ButtonProps> = (args) => {
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
        console.log('init');
      }

      getLayout(): HTMLElement {
        return this.element;
      }

    }
  });

  recyclerView.setData(makeid(500));

  return div;
};

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/html/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

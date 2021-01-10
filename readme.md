![CI](https://github.com/winetree94/VanillaRecyclerView/workflows/CI/badge.svg?branch=master)
[![GitHub license](https://img.shields.io/github/license/winetree94/VanillaRecyclerView)](https://github.com/winetree94/VanillaRecyclerView/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/vanilla-recycler-view.svg)](https://badge.fury.io/js/vanilla-recycler-view)

English | [한국어](https://github.com/winetree94/VanillaRecyclerView/blob/master/readme/readme-ko.md)

# VanillaRecyclerView For WebBrowser

![Honeycam 2021-01-01 10-06-55](https://user-images.githubusercontent.com/51369962/103431777-0f542c00-4c19-11eb-8148-269f7e62a491.gif)

VanillaRecyclerView is a high-performance UI rendering library for modern web browser. Specially designed with effectively control and render large amounts of data. It is built with pure JavaScript and is easy to use.
This can be used when you need to repeatedly display a lot of DOM in the scroll area, like Instagram.

Key support points are as follows.

### Virtual DOM

Renders only the areas you are viewing in real time in the entire scrolling area. This can speed up the initial rendering of the page and increase the overall performance.

### Reusable DOM

Rather than creating a new DOM at every moment, it reuses the existing DOM out of the current scroll area. You can minimize scroll performance degradation caused by real-time rendering.

---

# Live Examples

- [QuickStart(Vertical)](https://stackblitz.com/edit/vanilla-recycler-view-quickstart-example?file=index.js)
- [QuickStart(Horizontal)](https://stackblitz.com/edit/vanilla-recycler-view-quickstart-horizontal-example?file=index.js)
- [Use ReusableDOM feature](https://stackblitz.com/edit/vanilla-recycler-view-reusable-example?file=index.js)
- [Integrate with typescript](https://stackblitz.com/edit/vanilla-recycler-view-typescript-example?file=index.ts)
- [rendering complex layout](https://stackblitz.com/edit/vanilla-recycler-view-complex-example?file=index.ts)
- [infinity scroll](https://stackblitz.com/edit/vanilla-recycler-view-infinity-scroll-example?file=index.ts)

---

# Installation

#### In Web Browser

It can be imported directly into html without installation through CDN.

```html
<link rel="stylesheet" href="https://unpkg.com/vanilla-recycler-view@latest/dist/vanilla-recycler-view.min.css">
<script src="https://unpkg.com/vanilla-recycler-view@latest/dist/vanilla-recycler-view.min.js"></script>
```

```javascript
const root = document.getElementById('root');
const options = {...};
const recyclerView = new VanillaRecyclerView(table, options);
```

#### Webpack or other module bundlers

provide packages through npm.

```bash
$ npm i vanilla-recycler-view
```

```typescript
import VanillaRecyclerView from 'vanilla-recycler-view';
import 'vanilla-recycler-view/dist/vanilla-recycler-view.min.css';

const root = document.getElementById('root');
const options = {...};
const recyclerView = new VanillaRecyclerView(root, options);
```

---

# API Document

## 1. VanillaRecyclerViewOptions

VanillaRecyclerView can be used by providing at least two options: data and renderer. And the DOM element that will create the scroll area must have a fixed height.

A simple usage example with minimal options is shown below.
```javascript
const element = document.getElementById('element');
element.style.height = '500px';
const options = {
  data: [{}, {}, {}],
  renderer: class { ...This is explained below. }
}
new VanillRecyclerView(element, options);
```

Below is a list of all available options.
```typescript
export interface VanillaRecyclerViewOptions<T> {
  /*
   * Optional
   *
   * Specifies the direction of scrolling.
   * You can use either 'vertical' or 'horizontal'.
   * If not defined, it operates as 'vertical'.
   */
  direction?: DIRECTION;
  /*
   * Optional
   *
   * You can specify the area to be pre-rendered vertically or horizontally in pixels.
   * If flickering occurs when scrolling, this can be corrected by increasing this value.
   * If not defined, it will work at 50px.
   */
  preload?: number;
  /*
   * Optional
   *
   * Due to the limitations of the VirtualDom,
   * you must specify a fixed height or width value for each element.
   * It supports number or function.
   * Dynamic size allocation is possible for each element when used in function.
   * If not defined, it will work at 50px.
   */
  size?: ((params: RowHeightParams<T>) => number) | number;
  /**
   * Requirement
   * 
   * List of data to be rendered.
   */
  data: T[];
  /*
   * Requirement
   *
   * You must provide a constructor function or class to use for rendering.
   * This is explained below.
   */
  renderer: VanillaRecyclerViewRenderer<T>;
}
```

---

## 2. VanillaRecyclerViewRenderer

VanillaRecyclerView use provided renderer constructor to create a renderer instance and draw the layout
The provided class must define two prototype functions, initialize and getLayout.

In the initialize function, the DOM must be created with the data of the argument, and the created Dom must be returned in the getLayout function.

A simple example is shown below.
```javascript
new RecyclerView(element, {
  data: [{ name: 'first' }, { name: 'second' }, { name: 'third' }],
  renderer: class {
    initialize(params){
      this.layout = document.createElement('div');
      this.layout.innerHTML = `
        ${params.index}
        ${params.data.name}
      `;
    }
    getLayout(){
      return this.layout;
    }
  }
})
```

VanillaRecyclerView basically creates and uses one renderer instance per data element. However, if you define the onMount function, renderer instances that are off the screen are recycled and no new instances are created.

A simple example is shown below.
```javascript
new RecyclerView(element, {
  data: [{ name: 'first' }, { name: 'second' }, { name: 'third' }],
  renderer: class {
    initialize(params){
      this.layout = document.createElement('div');
      this.layout.innerHTML = `
        ${params.index}
        ${params.data.name}
      `;
    }
    getLayout(){
      return this.layout;
    }
    onMount(params) {
      this.layout.innerHTML = `
        ${params.index}
        ${params.data.name}
      `;
      return true;
    }
  }
})
```

The onMount function should access the previously created DOM with new data injected as an argument and replace the on-screen value.

In this way, the existing DOM is reused as it is, and only the values displayed on the screen are changed. The position on the scroll area of the DOM is managed by VanillaRecyclerView itself.

Below is a list and description of all functions available in the renderer.
```typescript
export interface VanillaRecyclerViewRenderer<T> {
  /*
   * Requirement
   *
   * Called when the renderer is created.
   * First you need to create the DOM and assign events to it.
   * The created DOM must be allocated inside the instance and returned through the getLayout function.
   */
  initialize: (params: LayoutParams<T>) => void;
  /*
   * Requirement
   *
   * This is the endpoint function that VanillaRecyclerView accesses the DOM internally.
   * Must return created DOM. 
   */
  getLayout: () => HTMLElement;
  /*
   * Optional, but highly recommended.
   *
   * This function is called just before the DOM is reused.
   * RecyclerView basically only works with VirtaulDom,
   * It enables ReusableDOM feature only when this function is implemented.
   * You need to reallocate the values of the DOM and bind new events.
   * 
   * If true is returned, VanillaRecyclerView determines that the renderer has been reused successfully.
   * and if false is returned, the reuse is canceled and a new renderer is created and used.
   */
  onMount?: (params: MountParams<T>) => boolean;
  /*
   * Optional
   * 
   * Called when the existing DOM leaves the scroll area.
   * Before onMount function called, you must disable old event listener from dom
   */
  onUnmount?: (params: UnmountParams<T>) => void;
}
```

## 3. VanillaRecyclerViewAPI

You can access the created instance through the VanillaRecyclerView constructor and also can use some API functions.

A simple usage example is shown below.
```javascript
const recyclerView = new VanillaRecyclerView(element, { ... });
recyclerView.push({});
```

Below is a list of all API functions that can be called.
```typescript
export interface VanillaRecyclerViewAPI<T> {
  /*
   * Recalculates the entire scroll area, and reassigns index and element-specific size to all virtual DOM objects.
   * This function is called automatically internally as needed, and there is no need to call it manually.
   */
  calcalateSize: () => void;
  /*
   * Returns the entire scroll area in px.
   */
  getMaxScrollSize: () => number;
  /**
   * replace all data.
   * it will destroy all of rendered elements and recreate
   */
  setData: (data: T[]) => void;
  /*
   * Add an element at a specific index position.
   * Multiple elements can be added at once.
   */
  insert: (index: number, ...data: T[]) => void;
  /*
   * Remove the element.
   * Works similarly to Array.prototype.splice
   */
  splice: (start: number, end?: number) => void;
  /*
   * Adds the element to the end.
   * Works similarly to Array.prototype.push
   */ 
  push: (...items: T[]) => void;
}
```
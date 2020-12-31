![CI](https://github.com/winetree94/VanillaContextMenu/workflows/CI/badge.svg?branch=master)

# VanillaRecyclerView For WebBrowser

VanillaRecyclerView 는 대용량 데이터를 효과적으로 화면에 렌더링하기 위한 웹 라이브러리 입니다.

이 라이브러리는 순수한 바닐라 자바스크립트로 만들어져 있으며, VirtualDom 과 ReusableDom 개념을 사용해 만들어져 있습니다.


---

# QuickStart

ㅁ

#### in browser

```html
<!-- using cdn -->
<link rel="stylesheet" href="https://unpkg.com/vanilla-context@1.0.13/dist/vanilla-context.min.css">
<script src="https://unpkg.com/vanilla-context@1.0.13/dist/vanilla-context.min.js"></script>
```

```javascript
const table = document.getElementById('table');
const options = {...};
const context = new VanillaContext(table, options);
```

#### in node.js

```typescript
import { VanillaContext } from 'vanilla-context';
import 'vanilla-context/dist/vanilla-context.min.css';

const table = document.getElementById('table');
const options = {...};
const context = new VanillaContext(table, options);
```

---

### Option interface

```typescript
interface VanillaContextOptions {
  debug?: boolean;
  autoClose?: boolean;
  nodes: ContextNode[] | ((e: Event) => ContextNode[]);
}
```

### ContextNode Interface

```typescript
interface ContextNode {
  renderer: Renderer;
  onClick: (params: ContextNodeEventParams) => void;
  children?: ContextNode[];
  disabled?: boolean | ((params: ContextDisabledParams) => boolean);
  height?: number | ((params: ContextHeightParams) => number);
}
```

### ContextNode callback parameter interfaces

click event callback function parameters interface
```typescript
export interface ContextNodeEventParams {
  api: VanillaContext;
  event: Event;
  originEvent: Event;
}
```

disabled callback function parameters interface
```typescript
export interface ContextDisabledParams {
  api: VanillaContext;
  originEvent: Event;
}
```

height callback function parameters interface
```typescript
export interface ContextHeightParams {
  api: VanillaContext;
  originEvent: Event;
}
```

# Renderer

you can use any type of renderer. string, function and class will works well

### Renderer Interface

```typescript
interface RendererInterface {
  init: (params: RendererParams) => void;
  getLayout: () => Node;
  destroy: () => void;
}
```
![CI](https://github.com/winetree94/VanillaRecyclerView/workflows/CI/badge.svg?branch=master)
[![GitHub license](https://img.shields.io/github/license/winetree94/VanillaRecyclerView)](https://github.com/winetree94/VanillaRecyclerView/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/vanilla-recycler-view.svg)](https://badge.fury.io/js/vanilla-recycler-view)

한국어 | [English](https://github.com/winetree94/VanillaRecyclerView/blob/master/readme/readme-en.md)

# VanillaRecyclerView For WebBrowser

![Honeycam 2021-01-01 10-06-55](https://user-images.githubusercontent.com/51369962/103431777-0f542c00-4c19-11eb-8148-269f7e62a491.gif)

VanillaRecyclerView 는 웹에서 대량의 데이터를 효과적으로 제어하고 화면에 렌더링하기 위한 고성능 UI 렌더링 라이브러리 입니다. 순수한 자바스크립트로 설계되었으며, 손쉬운 사용성을 제공합니다. 

인스타그램처럼 스크롤 영역에 수많은 DOM을 반복적으로 표현해야 하는 경우 사용할 수 있습니다.

주요 지원사항은 아래와 같습니다.

### 가상화 DOM

가로 또는 세로의 전체 스크롤 영역에서 사용자가 보고 있는 영역만을 실시간으로 렌더링합니다. 페이지의 초기 렌더링 속도를 향상시키고, 전체 퍼포먼스를 증가시킬 수 있습니다.

### 재사용 DOM

매 순간 새로운 DOM 을 생성하는 것이 아니라, 현재 스크롤 영역에서 벗어난 기존의 DOM 을 재사용합니다. 실시간 렌더링에 따른 스크롤 성능 저하를 최소화 할 수 있습니다.

---

# 실시간 예제들

- [빠른 시작(세로)](https://stackblitz.com/edit/vanilla-recycler-view-quickstart-example?file=index.js)
- [빠른 시작(가로)](https://stackblitz.com/edit/vanilla-recycler-view-quickstart-horizontal-example?file=index.js)
- [재사용 DOM 예제](https://stackblitz.com/edit/vanilla-recycler-view-reusable-example?file=index.js)
- [타입스크립트와 함께 사용](https://stackblitz.com/edit/vanilla-recycler-view-typescript-example?file=index.ts)
- [복잡한 레이아웃 구현](https://stackblitz.com/edit/vanilla-recycler-view-complex-example?file=index.ts)

---

# 설치 방법

#### 브라우저에서 사용시

CDN 을 통해 설치없이 html 에 직접 import 할 수 있습니다.

```html
<link rel="stylesheet" href="https://unpkg.com/vanilla-recycler-view@latest/dist/vanilla-recycler-view.min.css">
<script src="https://unpkg.com/vanilla-recycler-view@latest/dist/vanilla-recycler-view.min.js"></script>
```

```javascript
const root = document.getElementById('root');
const options = {...};
const recyclerView = new VanillaRecyclerView(table, options);
```

#### 웹팩 또는 이외의 모듈 번들러와 사용 시

npm 을 통한 패키지를 제공합니다.

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

# API 문서

## 1. 옵션

VanillaRecyclerView는 최소한 data, renderer 두개의 옵션을 제공해야 사용할 수 있습니다. 그리고 스크롤 영역을 생성할 DOM 엘리먼트는 반드시 정해진 높이를 가지고 있어야 합니다.

최소한의 옵션을 사용한 단순한 사용 예시는 아래와 같습니다.

```javascript
const element = document.getElementById('element');
element.style.height = '500px';
const options = {
  data: [{}, {}, {}],
  renderer: class { ...하단 참조 }
}
new VanillRecyclerView(element, options);
```

사용할 수 있는 모든 옵션의 목록은 아래와 같습니다.

```typescript
export interface VanillaRecyclerViewOptions<T> {
  /*
   * 선택사항
   *
   * 스크롤의 방향을 지정합니다.
   * 'vertical' 또는 'horizontal' 중 하나를 사용할 수 있습니다.
   * 정의하지 않으면 'vertical'로 동작합니다.
   */
  direction?: DIRECTION;
  /*
   * 선택사항
   *
   * 상하 또는 좌우로 미리 렌더링할 영역을 픽셀단위로 지정할 수 있습니다.
   * 스크롤 시 깜빡임이 발생할 경우 이 값을 늘려 해결할 수 있습니다.
   * 요소의 (최대 높이나 너비의 x 2) 값을 권장합니다.
   * 정의하지 않으면 50px로 동작합니다.
   */
  preload?: number;
  /*
   * 선택사항
   *
   * 가상화 방식의 한계로 인해, 요소별 높이 또는 너비를 절대값으로 지정해야 합니다.
   * 숫자 또는 함수 형태를 지원하며,
   * 함수 형태로 사용하는 경우 요소별로 동적인 사이즈 할당이 가능합니다.
   * 정의하지 않으면 50px로 동작합니다.
   */
  size?: ((params: RowHeightParams<T>) => number) | number;
  /**
   * 필수사항
   * 
   * 렌더링해야할 데이터 리스트입니다.
   */
  data: T[];
  /*
   * 필수사항
   *
   * 렌더링에 사용할 생성자 함수 또는 클래스를 제공해야 합니다.
   * 이는 하단에서 설명합니다.
   */
  renderer: VanillaRecyclerViewRenderer<T>;
}
```

---

## 2. 렌더러

VanillaRecyclerView 는 옵션의 renderer 프로퍼티를 통해 제공된 생성자 함수 또는 클래스로 렌더러 인스턴스를 생성하고 화면을 그리는데 사용합니다.

제공된 클래스는 반드시 initialize, getLayout 두개의 프로토타입 함수를 사전에 정의해야 합니다.

initilize 함수에서는 인자로 주입되는 데이터로 DOM 을 생성하고, getLayout 에서는 단순히 생성한 Dom 을 반환하도록 작성하면 됩니다.

단순한 예시는 아래와 같습니다.

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

VanillaRecyclerView 는 기본적으로 데이터 요소별로 하나의 렌더러 인스턴스를 생성해 사용합니다. 하지만 onMount 함수를 정의한 경우는 화면에서 벗어난 렌더러 인스턴스를 재활용하며, 인스턴스를 새로 생성하지 않습니다.

단순한 예시는 아래와 같습니다.
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

사용자는 onMount 함수의 인자로 주입되는 새로운 데이터로 이전에 생성한 DOM 에 접근하여 화면상의 값을 교체해야 합니다.

이렇게 하면 기존에 생성했던 DOM 은 그대로 재사용하게 되고, 화면에 표시되는 값만이 변경되게 됩니다. DOM 의 스크롤 영역상의 위치는 VanillaRecyclerView 에서 스스로 관리합니다.

렌더러에서 사용할 수 있는 모든 함수의 목록과 설명은 아래와 같습니다.
```typescript
export interface VanillaRecyclerViewRenderer<T> {
  /*
   * 필수사항
   *
   * 렌더러가 생성될 때 호출됩니다.
   * 여기에서 최초로 DOM을 생성하고 이벤트를 할당합니다.
   * 생성된 DOM은 인스턴스 내부에 할당해서 getLayout 함수를 통해 반환해야 합니다.
   */
  initialize: (params: LayoutParams<T>) => void;
  /*
   * 필수사항
   *
   * RecyclerView 가 내부적으로 DOM에 접근하는 엔드포인트 함수입니다.
   * 반드시 미리 생성한 DOM 을 반환해야합니다. 
   */
  getLayout: () => HTMLElement;
  /*
   * 선택사항, 하지만 권장됩니다.
   *
   * DOM이 재사용되기 직전에 호출되는 함수입니다.
   * RecyclerView 는 기본적으로 가상화 DOM 방식으로만 동작하며 이 함수가 구현되었을 경우에만 재사용 DOM 기능을 활성화합니다.
   * 기존에 생성한 DOM 의 값을 재할당하고, 새로운 이벤트를 바인딩해야 합니다.
   * 
   * true 를 반환하는 경우 VanillaRecyclerView 는 렌더러의 재사용에 성공했다고 판단하며,
   * false 를 반환하는 경우 재사용을 취소하고 새로운 렌더러를 생성해 사용합니다.
   */
  onMount?: (params: MountParams<T>) => boolean;
  /*
   * 선택사항
   * 
   * 기존 DOM 이 스크롤 영역에서 벗어날 때 호출됩니다.
   * 재사용할 DOM은 기존의 이벤트 리스너들이 남아있으므로,
   * 반드시 이 함수에서 기존의 이벤트를 해제해야 합니다.
   */
  onUnmount?: (params: UnmountParams<T>) => void;
}
```

## 3. VanillaRecyclerViewAPI

VanillaRecyclerView 생성자를 통해 생성된 인스턴스에 접근하여, API 함수를 사용할 수 있습니다.

단순한 사용 예시는 아래와 같습니다.
```javascript
const recyclerView = new VanillaRecyclerView(element, { ... });
recyclerView.push({});
```

호출 가능한 모든 API 함수의 목록은 아래와 같습니다.
```typescript
export interface VanillaRecyclerViewAPI<T> {
  /*
   * 전체 스크롤 영역을 재계산하고, 모든 가상 DOM 객체에 index 와 요소별 사이즈를 재할당합니다.
   * 이 함수는 필요에 따라 내부적으로 자동적으로 호출되며, 수동으로 호출할 필요가 없습니다.
   */
  calcalateSize: () => void;
  /*
   * 전체 스크롤 영역을 px 단위로 반환합니다.
   */
  getMaxScrollSize: () => number;
  /*
   * 요소를 특정 index 위치에 추가합니다.
   * 다중 요소를 한번에 추가할 수 있습니다.
   */
  insert: (index: number, ...data: T[]) => void;
  /*
   * 스크롤 영역에서 요소를 제거합니다.
   * Array.prototype.slice 와 동일하게 동작합니다.
   */
  splice: (start: number, end?: number) => void;
  /*
   * 요소를 스크롤 영역의 마지막 위치에 추가합니다.
   * Array.prototype.push 와 동일하게 동작합니다.
   */ 
  push: (...items: T[]) => void;
}
```
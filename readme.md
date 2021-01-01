![CI](https://github.com/winetree94/VanillaRecyclerView/workflows/CI/badge.svg?branch=master)
[![GitHub license](https://img.shields.io/github/license/winetree94/VanillaRecyclerView)](https://github.com/winetree94/VanillaRecyclerView/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/vanilla-recycler-view.svg)](https://badge.fury.io/js/vanilla-recycler-view)

한국어 | [English](https://github.com/winetree94/VanillaRecyclerView/blob/master/readme/readme-en.md)

# VanillaRecyclerView For WebBrowser

![Honeycam 2021-01-01 10-06-55](https://user-images.githubusercontent.com/51369962/103431777-0f542c00-4c19-11eb-8148-269f7e62a491.gif)

VanillaRecyclerView 는 웹에서 대량의 데이터를 효과적으로 제어하고 화면에 렌더링하기 위한 고성능 UI 라이브러리 입니다. 순수한 자바스크립트로 설계되었으며, 손쉬운 사용성을 제공합니다. 주요 지원사항은 아래와 같습니다.

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
const recyclerView = new RecyclerView(table, options);
```

#### 웹팩 또는 이외의 모듈 번들러와 사용 시

npm 을 통한 패키지를 제공합니다.

```bash
$ npm i vanilla-recycler-view
```

```typescript
import RecyclerView from 'vanilla-recycler-view';
import 'vanilla-recycler-view/dist/vanilla-recycler-view.min.css';

const root = document.getElementById('root');
const options = {...};
const recyclerView = new RecyclerView(root, options);
```

---

# API 문서

## 1. 옵션

```typescript
export interface RecyclerViewOptions<T> {
  /*
   * 선택사항
   *
   * 스크롤의 방향을 지정합니다.
   * 정의하지 않으면 가로 모드로 동작합니다.
   */
  direction?: DIRECTION;
  /*
   * 선택사항
   *
   * 상하 또는 좌우로 미리 렌더링할 영역을 픽셀단위로 지정할 수 있습니다.
   * 스크롤 시 깜빡임이 발생할 경우 이 값을 늘려 해결할 수 있습니다.
   * 정의하지 않으면 50px로 동작합니다.
   */
  preload?: number;
  /*
   * 선택사항
   *
   * 가상화 방식의 한계로 인해, 요소별 높이 또는 너비를 절대값으로 지정해야 합니다.
   * 숫자 또는 함수 형태로 동적 사이즈를 할당할 수 있습니다.
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
   * 아래에서 설명합니다.
   */
  renderer: RendererType<T>;
}
```

## 2. 렌더러

```typescript
export interface RecyclerViewRenderer<T> {
  /*
   * 필수항목
   *
   * 렌더러가 생성될 때 호출됩니다.
   * 여기에서 최초로 DOM을 생성하고 이벤트를 할당합니다.
   * 생성된 DOM은 인스턴스 내부에 할당해서 getLayout 함수를 통해 반환해야 합니다.
   */
  initialize: (params: LayoutParams<T>) => void;
  /*
   * 필수항목
   *
   * RecyclerView 가 내부적으로 DOM 을 꺼내는 엔드포인트 함수입니다.
   * 반드시 initialize 함수를 통해 생성된 DOM 을 반환해야합니다. 
   */
  getLayout: () => HTMLElement;
  /*
   * 선택항목, 하지만 권장됩니다.
   *
   * DOM이 재사용되기 직전에 호출되는 함수입니다.
   * RecyclerView 는 기본적으로 가상화 DOM 방식으로만 동작하며 이 함수가 구현되었을 경우에만 재사용 DOM 기능을 활성화합니다.
   * 기존에 생성한 DOM 의 값을 재할당하고, 새로운 이벤트를 바인딩해야 합니다.
   */
  onMount?: (params: MountParams<T>) => boolean;
  /*
   * 선택항목
   * 
   * 기존 DOM 이 스크롤 영역에서 벗어날 때 호출됩니다.
   * 재사용할 DOM은 기존의 이벤트 리스너들이 유지되므로,
   * 반드시 이 함수에서 기존의 이벤트를 해제해야 합니다.
   */
  onUnmount?: (params: UnmountParams<T>) => void;
}
```
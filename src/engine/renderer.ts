export interface ClassRenderer {
  init: () => void;
  getGui: () => HTMLElement;
  refresh?: () => boolean;
}

export type renderer = ClassRenderer | (() => HTMLElement) | string;

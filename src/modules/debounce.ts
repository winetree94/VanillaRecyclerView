/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function debounce(
  func: (...args: any[]) => any,
  wait: number,
  immediate?: boolean
): (...args: any[]) => any {
  let timeout: number | null;
  return function (this: any) {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, (args as unknown) as any[]);
    };
    const callNow = immediate && !timeout;
    window.clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);
    if (callNow) func.apply(context, (args as unknown) as any[]);
  };
}

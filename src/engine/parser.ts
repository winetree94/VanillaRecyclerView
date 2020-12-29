export function parsePx(str: string): number {
  return Number(str.split('px')[0]);
}

export function toPx(n: number): string {
  return n.toString() + 'px';
}

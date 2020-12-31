const [{ width, height }] = document.body.getClientRects();
let lastWidth = width;
let lastHeight = height;

setInterval(() => {
  const [{ width, height }] = document.body.getClientRects();
  if (width !== lastWidth || height !== lastHeight) {
    const event = new CustomEvent('zoom', {
      detail: {
        width: width,
        height: height,
      },
    });
    document.body.dispatchEvent(event);
    lastWidth = width;
    lastHeight = height;
  }
}, 100);

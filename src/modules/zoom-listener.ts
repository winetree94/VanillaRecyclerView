const { width, height } = document.body.getClientRects()[0];
let lastWidth = width;
let lastHeight = height;

setInterval(() => {
  const { width, height } = document.body.getClientRects()[0];
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

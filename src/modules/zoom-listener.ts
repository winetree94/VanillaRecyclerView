const { width, height } = document.body.getClientRects()[0];
let lastWidth = width;
let lastHeight = height;

setInterval(() => {
  const { width, height } = document.body.getClientRects()[0];
  if (width !== lastWidth || height !== lastHeight) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent('zoom', false, false, {
      detail: {
        width: width,
        height: height,
      },
    });
    document.body.dispatchEvent(e);
    lastWidth = width;
    lastHeight = height;
  }
}, 100);

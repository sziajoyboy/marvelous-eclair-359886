/* Film-grain texture generator → applied to #hero-grain */
(function () {
  function makeGrain() {
    const c = document.createElement('canvas');
    c.width = c.height = 160;
    const ctx = c.getContext('2d');
    const id = ctx.createImageData(160, 160);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i+1] = d[i+2] = v; d[i+3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    return c.toDataURL();
  }
  window.__applyGrain = function () {
    const url = makeGrain();
    document.querySelectorAll('#hero-grain, .grain').forEach(el => {
      el.style.backgroundImage = `url(${url})`;
      el.style.backgroundSize = '160px 160px';
    });
  };
  if (document.readyState !== 'loading') window.__applyGrain();
  else document.addEventListener('DOMContentLoaded', window.__applyGrain);
})();


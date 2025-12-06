import type {
  VistaViewDefaultControls,
  VistaViewCustomControl,
  VistaViewImage,
  VistaViewOptions,
} from './vista-view';

// Optimized SVG icons - common attributes applied via CSS
const chevronLeft = `<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>`;
const chevronRight = `<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>`;
const zoomInIcon = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`;
const zoomOutIcon = `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`;
const downloadIcon = `<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;
const closeIcon = `<svg viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

export function getDownloadButton(): VistaViewCustomControl {
  return {
    name: 'download',
    icon: downloadIcon,
    onClick: (image) => {
      const link = document.createElement('a');
      link.href = image.src;
      link.download = image.src.split('/').pop() || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  };
}

function convertControlToHtml(control: VistaViewDefaultControls | VistaViewCustomControl): string {
  if (typeof control === 'string') {
    switch (control) {
      case 'zoomIn':
        return `<button class="vistaview-zoom-in-button">${zoomInIcon}</button>`;
      case 'zoomOut':
        return `<button disabled class="vistaview-zoom-out-button">${zoomOutIcon}</button>`;
      case 'close':
        return `<button class="vistaview-close-button">${closeIcon}</button>`;
      case 'indexDisplay':
        return `<div class="vistaview-index-display"></div>`;
      default:
        return '';
    }
  }
  return `<button data-vistaview-custom-control="${control.name}">${control.icon}</button>`;
}

export function vistaViewComponent(
  elements: VistaViewImage[],
  controls: VistaViewOptions['controls']
): string {
  const mapCtrl = (arr?: (VistaViewDefaultControls | VistaViewCustomControl)[]) =>
    arr ? arr.map(convertControlToHtml).join('') : '';

  return `<div class="vistaview-root" id="vistaview-root">
<div class="vistaview-container">
<div class="vistaview-image-container">
${elements
  .map((el) => {
    const fit = el.image ? getComputedStyle(el.image).objectFit : '';
    const w = el.image?.width,
      h = el.image?.height;
    return `<div class="vistaview-item">
<img class="vistaview-image-lowres"${fit ? ` style="object-fit:${fit}"` : ''} src="${el.smallSrc || el.src}" alt="${el.alt || ''}" width="${w}" height="${h}">
<img class="vistaview-image-highres" data-vv-of="${fit}" style="width:${w}px;height:${h}px" src="${el.src}" alt="${el.alt || ''}" width="${el.width}" height="${el.height}">
</div>`;
  })
  .join('')}
</div>
<div class="vistaview-top-bar vistaview-ui"><div>${mapCtrl(controls?.topLeft)}</div><div>${mapCtrl(controls?.topCenter)}</div><div>${mapCtrl(controls?.topRight)}</div></div>
<div class="vistaview-bottom-bar vistaview-ui"><div>${mapCtrl(controls?.bottomLeft)}</div><div>${mapCtrl(controls?.bottomCenter)}</div><div>${mapCtrl(controls?.bottomRight)}</div></div>
<div class="vistaview-prev-btn vistaview-ui"><button>${chevronLeft}</button></div>
<div class="vistaview-next-btn vistaview-ui"><button>${chevronRight}</button></div>
</div>
</div>`;
}

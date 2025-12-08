import type {
  VistaViewDefaultControls,
  VistaViewCustomControl,
  VistaViewImageIndexed,
  VistaViewOptions,
} from './types';
import { createTrustedHtml } from './utils';

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
    onClick: async (image: VistaViewImageIndexed) => {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const finalUrl = response.url; // This is the redirected URL
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = finalUrl.split('/').pop()?.split('?')[0] || 'download';
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
        return `<button class="vistaview-zoom-in-btn">${zoomInIcon}</button>`;
      case 'zoomOut':
        return `<button disabled class="vistaview-zoom-out-btn">${zoomOutIcon}</button>`;
      case 'close':
        return `<button class="vistaview-close-btn">${closeIcon}</button>`;
      case 'indexDisplay':
        return `<div class="vistaview-index-display"></div>`;
      case 'description':
        return `<div class="vistaview-description"></div>`;
      default:
        return '';
    }
  }
  return `<button data-vistaview-custom-control="${control.name}">${control.icon}</button>`;
}

export function vistaViewItem(el: VistaViewImageIndexed): HTMLDivElement {
  const comp = el.imageElm ? getComputedStyle(el.imageElm) : null;
  const fit = comp?.objectFit || '';
  const nw = el.imageElm?.naturalWidth || '';
  const nh = el.imageElm?.naturalHeight || '';
  const w = comp?.width || '';
  const h = comp?.height || '';

  const div = document.createElement('div');
  div.className = 'vistaview-item';
  div.dataset.vistaviewIndex = el.index.toString();
  const inner = createTrustedHtml(`<img class="vistaview-image-lowres"
    style="${fit ? `object-fit:${fit};` : ''}${w ? `width:${w};` : ''}${h ? `height:${h};` : ''}"
    src="${el.thumb || el.src}" 
    alt="${el.alt || ''}"
    data-vistaview-index="${el.index}"
    ${nw ? `width="${nw}"` : ''}
    ${nh ? `height="${nh}"` : ''}
  />
  <img class="vistaview-image-highres" src="${el.src}" alt="${el.alt || ''}" />`);
  div.appendChild(inner);

  return div;
}

export function vistaViewComponent({
  controls,
  isReducedMotion,
  children,
}: {
  controls: VistaViewOptions['controls'];
  isReducedMotion: boolean;
  children: HTMLDivElement[];
}): DocumentFragment {
  const mapCtrl = (arr?: (VistaViewDefaultControls | VistaViewCustomControl)[]) =>
    arr ? arr.map(convertControlToHtml).join('') : '';

  const html = createTrustedHtml(
    `<div class="vistaview-root${isReducedMotion ? ' vistaview--reduced-motion' : ''}" id="vistaview-root">
    <div class="vistaview-container">
    <div class="vistaview-image-container"></div>
    <div class="vistaview-top-bar vistaview-ui"><div>${mapCtrl(controls?.topLeft)}</div><div>${mapCtrl(controls?.topCenter)}</div><div>${mapCtrl(controls?.topRight)}</div></div>
    <div class="vistaview-bottom-bar vistaview-ui"><div>${mapCtrl(controls?.bottomLeft)}</div><div>${mapCtrl(controls?.bottomCenter)}</div><div>${mapCtrl(controls?.bottomRight)}</div></div>
    <div class="vistaview-prev-btn vistaview-ui"><button>${chevronLeft}</button></div>
    <div class="vistaview-next-btn vistaview-ui"><button>${chevronRight}</button></div>
    </div>
    </div>`
  );

  const container = html.querySelector('.vistaview-image-container');
  children.forEach((child) => {
    container!.appendChild(child);
  });
  return html;
}

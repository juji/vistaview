
import type { 
  VistaViewDefaultControls,
  VistaViewCustomControl, 
  VistaViewImage, 
  VistaViewOptions 
} from './vista-view';

// const print = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`
const chevronLeft = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>`
const chevronRight = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`
const zoomIn = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-in-icon lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`
const zoomOut = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zoom-out-icon lucide-zoom-out"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="8" x2="14" y1="11" y2="11"/></svg>`
const download = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`
const close = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`

export function getDownloadButton(): VistaViewCustomControl {
  return {
    name: 'download',
    icon: download,
    onClick: (image) => {
      // Handle download
      const link = document.createElement('a');
      link.href = image.src;
      link.download = image.alt || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

function convertControlToHtml( control: VistaViewDefaultControls | VistaViewCustomControl ): string {
  if (typeof control === 'string') {
    switch (control) {
      case 'zoomIn':
        return `<button class="vistaview-zoom-in-button">${zoomIn}</button>`;
      case 'zoomOut':
        return `<button class="vistaview-zoom-out-button">${zoomOut}</button>`;
      case 'close':
        return `<button class="vistaview-close-button">${close}</button>`;
      case 'indexDisplay':
        return `<div class="vistaview-index-display"></div>`;
      default:
        return '';
    }
  } else {
    return `<button data-vistaview-custom-control="${control.name}">${control.icon}</button>`;
  }
}

export function vistaViewComponent( 
  elements: VistaViewImage[],
  controls: VistaViewOptions['controls'] 
): string {
  return `<div class="vistaview-root" id="vistaview-root">
    <div class="vistaview-container">
      <div class="vistaview-image-container">
        ${elements.map( el => {
          const imageObjectFit = el.image?.computedStyleMap().get('object-fit')?.toString();
          return `
            <div class="vistaview-item">
              <img class="vistaview-image-lowres"
                style="${imageObjectFit ? `object-fit: ${imageObjectFit};` : ''}"
                src="${el.smallSrc || el.src}" alt="${el.alt || ''}" width="${el.image?.width}" height="${el.image?.height}" />
              <img class="vistaview-image-highres"
                data-vistaview-thumbnail-objectfit="${imageObjectFit}"
                style="width: ${el.image?.width}px; height: ${el.image?.height}px;"
                src="${el.src}" alt="${el.alt || ''}" width="${el.width}" height="${el.height}" />
            </div>
          `
        }).join('')}
      </div>
      <div class="vistaview-top-bar vistaview-ui">
        <div>${controls?.topLeft ? controls.topLeft.map( control => convertControlToHtml(control) ).join('') : ''}</div>
        <div>${controls?.topCenter ? controls.topCenter.map( control => convertControlToHtml(control) ).join('') : ''}</div>
        <div>${controls?.topRight ? controls.topRight.map( control => convertControlToHtml(control) ).join('') : ''}</div>
      </div>
      <div class="vistaview-bottom-bar vistaview-ui">
          <div>${controls?.bottomLeft ? controls.bottomLeft.map( control => convertControlToHtml(control) ).join('') : ''}</div>
          <div>${controls?.bottomCenter ? controls.bottomCenter.map( control => convertControlToHtml(control) ).join('') : ''}</div>
          <div>${controls?.bottomRight ? controls.bottomRight.map( control => convertControlToHtml(control) ).join('') : ''}</div>
      </div>
      <div class="vistaview-prev-btn vistaview-ui"><button>${chevronLeft}</button></div>
      <div class="vistaview-next-btn vistaview-ui"><button>${chevronRight}</button></div>
    </div>
  </div>`;
}


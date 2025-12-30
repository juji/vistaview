import type { VistaData, VistaExtension } from '../types';
import type { VistaView } from '../vista-view';

// okayy
const downloadIcon = `<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

export function download(): VistaExtension {
  let currentImage: string | null = null;
  let currentAlt: string | null = null;
  let button: HTMLButtonElement | null = null;

  return {
    name: 'download',
    control: () => {
      button = document.createElement('button');
      button.setAttribute('aria-label', 'Download');
      button.innerHTML = downloadIcon;
      button.addEventListener('click', async () => {
        if (!currentImage) return;
        if (button?.classList.contains('vvw--pulsing')) return; // prevent multiple clicks
        button?.classList.add('vvw--pulsing');

        let response: Response | null = await fetch(currentImage);
        let blob: Blob | null = await response.blob();
        const finalUrl = response.url; // This is the redirected URL

        const alt = currentAlt;
        const extension = finalUrl.split('?')[0].split('#')[0].split('.').pop();
        const fileName = alt
          ? `${alt}.${extension}`
          : finalUrl.split('?')[0].split('#')[0].split('/').pop() || 'download.' + extension;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        blob = null;
        response = null;
        button?.classList.remove('vvw--pulsing');
      });
      return button;
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const centerImage = vistaData.images.to
        ? vistaData.images.to[Math.floor(vistaData.images.to.length / 2)]
        : null;

      if (!centerImage) {
        currentImage = null;
        currentAlt = null;
        return;
      }
      const { parsedSrcSet, config } = centerImage;

      // get the biggest image || the current image
      currentImage =
        parsedSrcSet && parsedSrcSet.length > 0
          ? parsedSrcSet[parsedSrcSet.length - 1].src
          : config.src || null;

      currentAlt = config.alt || null;
    },
    onClose: (_vistaView: VistaView) => {
      button?.remove();
      button = null;
      currentImage = null;
      currentAlt = null;
    },
  };
}

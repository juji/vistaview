import type { VistaImage } from './vista-image';

export class VistaState {
  open = false;
  settled = false;
  closing = false;
  zoomedIn = false;

  children: {
    htmls: HTMLElement[];
    images: VistaImage[];
  } = {
    htmls: [],
    images: [],
  };

  currentIndex = -1;
  abortController: AbortController = new AbortController();
  isReducedMotion = false;
}

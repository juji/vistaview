import type { VistaImage } from './vista-image';

export class VistaState {
  open = false;
  settled = false;
  closing = false;
  zoomedIn = false;
  images: VistaImage[] = [];
  currentIndex = -1;
  abortController: AbortController = new AbortController();
  isReducedMotion = false;
}

import type { VistaExtension } from './types';
import type { VistaBox } from './vista-box';

export class VistaState {
  open = false;
  settled = false;
  closing = false;
  zoomedIn = false;

  children: {
    htmls: HTMLElement[];
    images: VistaBox[];
  } = {
    htmls: [],
    images: [],
  };

  currentIndex = -1;
  elmLength = 0;
  abortController: AbortController = new AbortController();
  isReducedMotion = false;

  extensions: Set<VistaExtension> = new Set();
}

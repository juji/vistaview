import type { VistaView } from '../vista-view';

// run on initialization, when we open the viewer
export function init(vistaView: VistaView) {
  // setup container width and position
  const preloads = vistaView.options.preloads!;
  vistaView.imageContainer!.style.width = `${(preloads * 2 + 1) * 100}vw`;
  vistaView.imageContainer!.style.left = `-${preloads * 100}vw`;
  vistaView.imageContainer!.style.display = 'flex';
}

import type { VistaData } from '../types';

export function setup(params: VistaData) {
  const elms = params.htmlElements.to ? params.htmlElements.to : null;
  if (!elms) return;

  // set positions
  // elms.forEach((elm, idx) => {
  //   elm.style.left = `${idx * 100}%`;
  // });
}

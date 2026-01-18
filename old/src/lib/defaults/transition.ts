import type { VistaData } from '../types';
import type { VistaView } from '../vista-view';

// run on every image transition
export function transition(
  { htmlElements: { to: HtmlTo }, index: { from: fromIndex, to: toIndex } }: VistaData,
  signal: AbortSignal,
  vistaView: VistaView
) {
  const { imageContainer: imgc, options } = vistaView;
  const { isReducedMotion } = vistaView.state;

  if (!HtmlTo || signal.aborted || isReducedMotion) return;

  const adjacent =
    Math.abs(toIndex! - fromIndex!) === 1 ||
    (fromIndex === 0 && toIndex === vistaView.state.elmLength - 1) ||
    (fromIndex === vistaView.state.elmLength - 1 && toIndex === 0);

  // for non-adjacent
  // just return
  if (!adjacent) {
    return;
  }

  // adjacent transition
  // with no reduced motion preference
  // slide left/right

  return {
    cleanup: () => {
      imgc!.style.transition = '';
      imgc!.style.transform = '';
    },
    transitionEnded: new Promise<void>((r) => {
      imgc!.addEventListener(
        'transitionend',
        () => {
          r();
        },
        { once: true }
      );
      imgc!.addEventListener(
        'transitioncancel',
        () => {
          if (signal.aborted) r();
        },
        { once: true }
      );

      const duration = Math.round(options.animationDurationBase! * 100) / 100;
      const transform =
        toIndex! === fromIndex! + 1 ||
        (fromIndex === vistaView.state.elmLength - 1 && toIndex === 0)
          ? 'translateX(-100vw)'
          : 'translateX(100vw)';

      imgc!.style.transition = `transform ${duration}ms ease`;
      imgc!.style.transform = transform;
    }),
  };
}

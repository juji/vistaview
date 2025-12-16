import type { VistaData } from '../types';

// run on every image transition
export async function transition(
  {
    vistaView: { isReducedMotion },
    htmlElements: { to: HtmlTo },
    index: { from: fromIndex, to: toIndex },
    vistaView: { elements, imageContainer: imgc, options },
  }: VistaData,
  signal: AbortSignal,
  rapid?: boolean
) {
  if (!HtmlTo || rapid || signal.aborted || isReducedMotion) return;

  const adjacent =
    Math.abs(toIndex! - fromIndex!) === 1 ||
    (fromIndex === 0 && toIndex === elements.length - 1) ||
    (fromIndex === elements.length - 1 && toIndex === 0);

  // for non-adjacent, or reduced motion preference
  // just return
  if (!adjacent) {
    return;
  }

  const duration = Math.round(options.animationDurationBase! * 1.5 * 100) / 100;

  // adjacent transition
  // with no reduced motion preference
  // slide left/right

  return new Promise<() => void>((r) => {
    imgc!.addEventListener(
      'transitionend',
      () => {
        r(() => {
          imgc!.style.transition = '';
          imgc!.style.transform = '';
        });
      },
      { once: true }
    );

    const transform =
      toIndex! === fromIndex! + 1 || (fromIndex === elements.length - 1 && toIndex === 0)
        ? 'translateX(-100vw)'
        : 'translateX(100vw)';

    imgc!.style.transition = `transform ${duration}ms ease`;
    imgc!.style.transform = transform;
  });
}

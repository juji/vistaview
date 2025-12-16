import type { VistaData } from '../types';

// wawit for the image to be ready
// class: 'vvw-image--loaded vvw-image--ready'
// 'vvw-image--ready' is added right after the image is animated
// 'vvw-image--loaded' is added right after the image is loaded
// loaded first, then animated
function waitForClass(
  element: HTMLImageElement,
  className: string = 'vvw-img--ready'
): Promise<void> {
  // Check if it already has the class
  if (element.classList.contains(className)) {
    return Promise.resolve(); // ← Important! Return immediately
  }

  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (element.classList.contains(className)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['class'],
    });
  });
}

export async function transition(
  {
    vistaView: { isReducedMotion },
    htmlElements: { to: HtmlTo },
    index: { from: fromIndex, to: toIndex },
    vistaView: { elements, imageContainer: imgc, options },
  }: VistaData,
  signal: AbortSignal
) {
  if (!HtmlTo) return;

  if (signal.aborted) return;

  const adjacent =
    Math.abs(toIndex! - fromIndex!) === 1 ||
    (fromIndex === 0 && toIndex === elements.length - 1) ||
    (fromIndex === elements.length - 1 && toIndex === 0);

  const duration = Math.round(options.animationDurationBase! * 0.5 * 100) / 100;

  // for non-adjacent, or reduced motion preference
  // just fade out/in
  if (!adjacent || isReducedMotion) {
    return new Promise<() => void>((r) => {
      function clean() {
        r(() => {
          imgc!.style.transition = '';
          imgc!.style.opacity = '';
        });
      }

      imgc!.style.opacity = '1';
      imgc!.style.transition = `opacity ${duration}ms ease`;
      requestAnimationFrame(() => {
        if (signal.aborted) return clean();
        imgc?.addEventListener(
          'transitionend',
          () => {
            if (signal.aborted) return clean();
            imgc.innerHTML = '';
            imgc.appendChild(HtmlTo[Math.floor(HtmlTo.length / 2)] as HTMLElement);
            imgc?.addEventListener(
              'transitionend',
              async () => {
                if (signal.aborted) return clean();

                const hires = imgc.querySelector('img.vvw-img-hi') as HTMLImageElement;
                await waitForClass(hires!);

                clean();
              },
              { once: true }
            );
            imgc!.style.opacity = '1';
          },
          { once: true }
        );
        imgc!.style.opacity = '0';
      });
    });
  } else {
    // adjacent transition
    // with no reduced motion preference
    // slide left/right
    imgc!.style.transition = `transform ${duration}ms ease`;
    imgc!.style.transform =
      toIndex! > fromIndex! || (fromIndex === elements.length - 1 && toIndex === 0)
        ? 'translateX(-100%)'
        : 'translateX(100%)';

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
    });
  }
}

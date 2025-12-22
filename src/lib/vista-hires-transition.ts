export type VistaHiresTransitionOpt = {
  current: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scale?: number;
  };
  target: {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    scale?: number;
  };
  log?: boolean;
};

export class VistaHiresTransition {
  private static map: Map<HTMLImageElement, VistaHiresTransitionOpt> = new Map();

  private static setStyles(img: HTMLImageElement, styles: VistaHiresTransitionOpt['current']) {
    const transformParts: string[] = [];
    if (styles.x !== undefined || styles.y !== undefined)
      transformParts.push(`translate3d(${styles.x || 0}px, ${styles.y || 0}px, 0px)`);
    if (styles.scale !== undefined)
      transformParts.push(`scale3d(${styles.scale}, ${styles.scale}, 1)`);
    if (styles.width !== undefined) img.style.width = `${styles.width}px`;
    if (styles.height !== undefined) img.style.height = `${styles.height}px`;
    if (transformParts.length > 0) img.style.transform = transformParts.join(' ');
  }

  private static play(img: HTMLImageElement, onComplete: () => void, shouldWait: () => boolean) {
    if (shouldWait()) {
      requestAnimationFrame(() => {
        this.play(img, onComplete, shouldWait);
      });
      return;
    }

    // this is possible, that the animation was removed in between frames
    if (!this.map.get(img)) return;

    // check if the animation was cancelled in between frames
    if (img.classList.contains('vvw--load-cancelled')) return;

    requestAnimationFrame(() => {
      // check again
      const animation = this.map.get(img);
      if (!animation) return;
      if (img.classList.contains('vvw--load-cancelled')) return;

      const { current, target, log } = animation;

      let now: VistaHiresTransitionOpt['current'] = {};
      if (current.width && target.width)
        now.width = current.width + (target.width - current.width) * 0.1;
      if (current.height && target.height)
        now.height = current.height + (target.height - current.height) * 0.1;
      if (current.x && target.x) now.x = current.x + (target.x - current.x) * 0.1;
      if (current.y && target.y) now.y = current.y + (target.y - current.y) * 0.1;
      if (current.scale && target.scale)
        now.scale = current.scale + (target.scale - current.scale) * 0.1;
      const allIsDone = Object.keys(now).every((key) => {
        const k = key as keyof VistaHiresTransitionOpt['current'];
        if (now[k] !== undefined && target[k] !== undefined) {
          const diff =
            k === 'scale'
              ? (now[k] as number) / (target[k] as number)
              : Math.abs((now[k] as number) - (target[k] as number));

          return k === 'scale' ? diff > 0.99 && diff < 1.01 : diff < 1;
        }
        return true;
      });

      if (allIsDone) {
        this.setStyles(img, target);
        this.map.delete(img);
        onComplete();
      } else {
        this.map.set(img, { current: now, target, log });
        this.setStyles(img, now);
        this.play(img, onComplete, shouldWait);
      }
    });
  }

  static stop(img: HTMLImageElement) {
    const map = this.map.get(img);
    this.map.delete(img);
    return map;
  }

  static start({
    img,
    options,
    onComplete,
    shouldWait,
  }: {
    img: HTMLImageElement;
    options: VistaHiresTransitionOpt;
    onComplete: () => void;
    shouldWait: () => boolean;
  }) {
    this.map.set(img, options);
    this.play(img, onComplete, shouldWait);
  }
}

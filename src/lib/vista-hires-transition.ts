import type { VistaImage, VistaImageState } from './vista-image';

export type VistaHiresTransitionOpt = {
  current: VistaImageState;
  target: {
    width?: number;
    height?: number;
    transform?: {
      x?: number;
      y?: number;
      scale?: number;
    };
  };
  log?: boolean;
};

export class VistaHiresTransition {
  private static map: Map<VistaImage, VistaHiresTransitionOpt> = new Map();

  private static play(vistaImage: VistaImage, onComplete: () => void, shouldWait: () => boolean) {
    if (shouldWait()) {
      requestAnimationFrame(() => {
        this.play(vistaImage, onComplete, shouldWait);
      });
      return;
    }

    // this is possible, that the animation was removed in between frames
    if (!this.map.get(vistaImage)) return;

    // check if the animation was cancelled in between frames
    if (vistaImage.image!.classList.contains('vvw--load-cancelled')) return;

    requestAnimationFrame(() => {
      // check again
      const animation = this.map.get(vistaImage);
      if (!animation) return;
      if (vistaImage.image!.classList.contains('vvw--load-cancelled')) return;

      const { current, target, log } = animation;

      let now: VistaHiresTransitionOpt['target'] = {};
      if (target.width !== undefined) {
        const diffW = target.width - current._width;
        now.width = current._width + diffW * 0.2;
        if (Math.abs(diffW) < 0.5) now.width = target.width;
      }
      if (target.height !== undefined) {
        const diffH = target.height - current._height;
        now.height = current._height + diffH * 0.2;
        if (Math.abs(diffH) < 0.5) now.height = target.height;
      }
      if (target.transform?.x !== undefined) {
        const diffX = target.transform.x - current.translate.x;
        now.transform = now.transform || {};
        now.transform.x = current.translate.x + diffX * 0.2;
        if (Math.abs(diffX) < 0.5) now.transform.x = target.transform.x;
      }
      if (target.transform?.y !== undefined) {
        const diffY = target.transform.y - current.translate.y;
        now.transform = now.transform || {};
        now.transform.y = current.translate.y + diffY * 0.2;
        if (Math.abs(diffY) < 0.5) now.transform.y = target.transform.y;
      }
      if (target.transform?.scale !== undefined) {
        const diffS = target.transform.scale - current.transform.scale;
        now.transform = now.transform || {};
        now.transform.scale = current.transform.scale + diffS * 0.2;
        if (Math.abs(diffS) < 0.005) now.transform.scale = target.transform.scale;
      }

      // apply now to image state
      if (now.width !== undefined) current.width = now.width;
      if (now.height !== undefined) current.height = now.height;
      if (now.transform?.x !== undefined) current.translate.x = now.transform.x;
      if (now.transform?.y !== undefined) current.translate.y = now.transform.y;
      if (now.transform?.scale !== undefined) current.transform.scale = now.transform.scale;

      const allIsDone =
        (target.width === undefined || current._width === target.width) &&
        (target.height === undefined || current._height === target.height) &&
        (target.transform?.x === undefined || current._translate.x === target.transform.x) &&
        (target.transform?.y === undefined || current._translate.y === target.transform.y) &&
        (target.transform?.scale === undefined ||
          current._transform.scale === target.transform.scale);

      if (allIsDone) {
        this.map.delete(vistaImage);
        onComplete();
      } else {
        this.map.set(vistaImage, { current, target, log });
        this.play(vistaImage, onComplete, shouldWait);
      }
    });
  }

  static stop(vistaImage: VistaImage) {
    const map = this.map.get(vistaImage);
    this.map.delete(vistaImage);
    return map;
  }

  static start({
    vistaImage,
    target,
    onComplete,
    shouldWait,
  }: {
    vistaImage: VistaImage;
    target: VistaHiresTransitionOpt['target'];
    onComplete: () => void;
    shouldWait: () => boolean;
  }) {
    this.map.set(vistaImage, {
      current: vistaImage.state,
      target,
    });
    this.play(vistaImage, onComplete, shouldWait);
  }
}

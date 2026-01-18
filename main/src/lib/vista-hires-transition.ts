import type { VistaBox } from './vista-box';
import type { VistaImageState } from './types';

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
    translate?: { x?: number; y?: number };
  };
  log?: boolean;
};

export class VistaHiresTransition {
  private static map: Map<VistaBox, VistaHiresTransitionOpt> = new Map();

  private static ease(current: number, target: number, threshold: number): number {
    const diff = target - current;
    const next = current + diff * 0.2;
    return Math.abs(diff) < threshold ? target : next;
  }

  private static play(vistaImage: VistaBox, onComplete: () => void, shouldWait: () => boolean) {
    if (shouldWait()) {
      requestAnimationFrame(() => {
        this.play(vistaImage, onComplete, shouldWait);
      });
      return;
    }

    // this is possible, that the animation was removed in between frames
    if (!this.map.get(vistaImage)) {
      return;
    }

    // check if the animation was cancelled in between frames
    if (vistaImage.element!.classList.contains('vvw--load-cancelled')) {
      return;
    }

    requestAnimationFrame(() => {
      // check again
      const animation = this.map.get(vistaImage);
      if (!animation) return;
      if (!vistaImage.element) return;
      if (vistaImage.element.classList.contains('vvw--load-cancelled')) return;

      const { current, target, log } = animation;

      let now: VistaHiresTransitionOpt['target'] = {};
      if (target.width !== undefined) {
        now.width = this.ease(current._width, target.width, 1);
      }
      if (target.height !== undefined) {
        now.height = this.ease(current._height, target.height, 1);
      }
      if (target.transform?.x !== undefined) {
        now.transform = now.transform || {};
        now.transform.x = this.ease(current._transform.x, target.transform.x, 1);
      }
      if (target.transform?.y !== undefined) {
        now.transform = now.transform || {};
        now.transform.y = this.ease(current._transform.y, target.transform.y, 1);
      }
      if (target.transform?.scale !== undefined) {
        now.transform = now.transform || {};
        now.transform.scale = this.ease(current._transform.scale, target.transform.scale, 0.005);
      }
      if (target.translate?.x !== undefined) {
        now.translate = now.translate || {};
        now.translate.x = this.ease(current._translate.x, target.translate.x, 1);
      }
      if (target.translate?.y !== undefined) {
        now.translate = now.translate || {};
        now.translate.y = this.ease(current._translate.y, target.translate.y, 1);
      }

      // apply now to image state
      if (now.width !== undefined) current.width = now.width;
      if (now.height !== undefined) current.height = now.height;

      // make the change trigger re-render

      if (now.translate) current.translate = { ...current.translate, ...now.translate };
      if (now.transform) current.transform = { ...current.transform, ...now.transform };

      const allIsDone =
        (target.width === undefined || current._width === target.width) &&
        (target.height === undefined || current._height === target.height) &&
        (target.transform?.x === undefined || current._transform.x === target.transform.x) &&
        (target.transform?.y === undefined || current._transform.y === target.transform.y) &&
        (target.transform?.scale === undefined ||
          current._transform.scale === target.transform.scale) &&
        (target.translate?.x === undefined || current._translate.x === target.translate.x) &&
        (target.translate?.y === undefined || current._translate.y === target.translate.y);

      if (allIsDone) {
        this.map.delete(vistaImage);
        onComplete();
      } else {
        this.map.set(vistaImage, { current, target, log });
        this.play(vistaImage, onComplete, shouldWait);
      }
    });
  }

  static stop(vistaImage: VistaBox) {
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
    vistaImage: VistaBox;
    target: VistaHiresTransitionOpt['target'];
    onComplete: () => void;
    shouldWait: () => boolean;
  }) {
    // stop any existing animation
    // keep in mind this is dangerously close to breaking
    // when another function that relies on 'stop' is called,
    // such as 'swap' in vista-view.ts: it relies on the returned value of 'stop'
    // but for now, this is acceptable,
    // since vista-view.ts only care about initial animation
    this.stop(vistaImage);

    // start new animation
    this.map.set(vistaImage, {
      current: vistaImage.state,
      target,
    });
    this.play(vistaImage, onComplete, shouldWait);
  }
}

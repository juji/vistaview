// Throttle: Function execution rate limiter
// Ensures that the function is not called more than once in the specified wait time.

export class Throttle {
  fiolast: { [key: string]: number } = {};
  lioTimeout: { [key: string]: ReturnType<typeof setTimeout> } = {};

  // first in out
  fio(func: () => void, id: string, wait: number = 50): void {
    const now = Date.now();
    const timeSinceLastCall = now - (this.fiolast[id] ?? 0);

    const invoke = () => {
      this.fiolast[id] = Date.now();
      func();
    };

    if (!this.fiolast[id]) {
      invoke();
      return;
    }

    if (timeSinceLastCall >= wait) {
      invoke();
    }
  }

  // last in out
  lio(func: () => void, id: string, wait: number = 50): void {
    if (this.lioTimeout[id]) {
      clearTimeout(this.lioTimeout[id]);
    }

    this.lioTimeout[id] = setTimeout(() => {
      func();
      delete this.lioTimeout[id];
    }, wait);
  }
}

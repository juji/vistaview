// FIFO function execution control
// Ensures that the function is not called more than once in the specified wait time.

export class Fifo {
  last: { [key: string]: number } = {};
  exec(func: () => void, id: string, wait: number = 50): void {
    const now = Date.now();
    const timeSinceLastCall = now - (this.last[id] ?? 0);

    const invoke = () => {
      this.last[id] = Date.now();
      func();
    };

    if (!this.last[id]) {
      invoke();
      return;
    }

    if (timeSinceLastCall >= wait) {
      invoke();
    }
  }
}

// FIFO function execution control
// Ensures that the function is not called more than once in the specified wait time.

export class Fifo {
  fifoLastCall: { [key: string]: number } = {};
  exec(func: () => void, id: string, wait: number = 50): void {
    const now = Date.now();
    const timeSinceLastCall = now - (this.fifoLastCall[id] ?? 0);

    const invoke = () => {
      this.fifoLastCall[id] = Date.now();
      func();
    };

    if (!this.fifoLastCall[id]) {
      invoke();
      return;
    }

    if (timeSinceLastCall >= wait) {
      invoke();
    }
  }
}

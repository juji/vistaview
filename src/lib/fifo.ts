// FIFO function execution control
// Ensures that the function is not called more than once in the specified wait time.
let fifoLastCall: { [key: string]: number } = {};
export function fifo(func: () => void, id: string, wait: number = 1000): void {
  const now = Date.now();

  if (!fifoLastCall[id]) fifoLastCall[id] = 0;

  const timeSinceLastCall = now - fifoLastCall[id];

  const invoke = () => {
    fifoLastCall[id] = Date.now();
    func();
  };

  if (!fifoLastCall[id]) {
    invoke();
    return;
  }

  if (timeSinceLastCall >= wait) {
    invoke();
  }
}

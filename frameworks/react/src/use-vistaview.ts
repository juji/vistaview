import { useEffect, useRef, useCallback } from 'react';
import { vistaView } from 'vistaview';
import type { VistaParams, VistaInterface } from 'vistaview';

export function useVistaView(options: VistaParams): VistaInterface {
  const instance = useRef<VistaInterface | null>(null);

  useEffect(() => {
    instance.current = vistaView(options);
    return () => {
      instance.current?.destroy();
      instance.current = null;
    };
  }, [options]);

  return {
    open: useCallback((i = 0) => instance.current?.open(i), []),
    close: useCallback(() => instance.current?.close() ?? Promise.resolve(), []),
    reset: useCallback(() => instance.current?.reset(), []),
    next: useCallback(() => instance.current?.next(), []),
    prev: useCallback(() => instance.current?.prev(), []),
    zoomIn: useCallback(() => instance.current?.zoomIn(), []),
    zoomOut: useCallback(() => instance.current?.zoomOut(), []),
    getCurrentIndex: useCallback(() => instance.current?.getCurrentIndex() ?? -1, []),
    view: useCallback((i: number) => instance.current?.view(i), []),
    destroy: useCallback(() => instance.current?.destroy(), []),
  };
}
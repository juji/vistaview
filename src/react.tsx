import { useEffect, useRef, useCallback, useId, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import { vistaView } from './vistaview';
import type { VistaParams, VistaInterface, VistaOpt } from './vistaview';

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

export interface VistaViewProps {
  children: ReactNode;
  selector?: string;
  options?: VistaOpt;
  ref?: React.Ref<VistaInterface>;
}

export function VistaView({ children, selector = '> a', options, id, ref, ...rest }: VistaViewProps & React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VistaInterface | null>(null);
  const generatedId = useId();
  const galleryId = id || `vvw-gallery-${generatedId.replace(/:/g, '')}`;

  useImperativeHandle(ref, () => instanceRef.current!, []);

  useEffect(() => {
    if (!containerRef.current) return;

    instanceRef.current = vistaView({
      ...options,
      elements: `#${galleryId} ${selector}`,
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [galleryId, selector, options, children]);

  return (
    <div ref={containerRef} {...rest} id={galleryId}>
      {children}
    </div>
  );
}


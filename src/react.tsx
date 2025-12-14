import { useEffect, useRef, useCallback } from 'react';
import { vistaView } from './vistaview';
import type { VistaViewParams, VistaViewInterface, VistaImg } from './vistaview';

export type { VistaViewParams, VistaViewInterface, VistaImg };

type UseVistaViewReturn = {
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export function useVistaView(options: VistaViewParams): UseVistaViewReturn {
  const instance = useRef<VistaViewInterface | null>(null);

  useEffect(() => {
    instance.current = vistaView(options);
    return () => {
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  return {
    open: useCallback((i = 0) => instance.current?.open(i), []),
    close: useCallback(() => instance.current?.close(), []),
    next: useCallback(() => instance.current?.next(), []),
    prev: useCallback(() => instance.current?.prev(), []),
    getCurrentIndex: useCallback(() => instance.current?.getCurrentIndex() ?? -1, []),
    view: useCallback((i: number) => instance.current?.view(i), []),
  };
}

type VistaViewProps = VistaViewParams & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  selector: string;
};

export function VistaView({
  children,
  className,
  style,
  selector,
  ...options
}: VistaViewProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useRef<VistaViewInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!selector) throw new Error('VistaView: selector is required');
    instance.current = vistaView({ ...options, elements: ref.current.querySelectorAll(selector) });
    return () => {
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

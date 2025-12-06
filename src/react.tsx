import { useEffect, useRef, useCallback } from 'react';
import { vistaView } from './vistaview';
import type { VistaViewOptions, VistaViewInterface, VistaViewImage } from './vistaview';

export type { VistaViewOptions, VistaViewInterface, VistaViewImage };

type UseVistaViewOptions = Omit<VistaViewOptions, 'parent'>;

type UseVistaViewReturn = {
  ref: React.RefObject<HTMLDivElement | null>;
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export function useVistaView(options: UseVistaViewOptions = {}): UseVistaViewReturn {
  const ref = useRef<HTMLDivElement>(null);
  const instance = useRef<VistaViewInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current = vistaView({ parent: ref.current, ...options });
    return () => {
      instance.current?.destroy();
      instance.current = null;
    };
  }, []);

  return {
    ref,
    open: useCallback((i = 0) => instance.current?.open(i), []),
    close: useCallback(() => instance.current?.close(), []),
    next: useCallback(() => instance.current?.next(), []),
    prev: useCallback(() => instance.current?.prev(), []),
    getCurrentIndex: useCallback(() => instance.current?.getCurrentIndex() ?? -1, []),
    view: useCallback((i: number) => instance.current?.view(i), []),
  };
}

type VistaViewProps = UseVistaViewOptions & {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function VistaView({
  children,
  className,
  style,
  ...options
}: VistaViewProps): React.ReactElement {
  const { ref } = useVistaView(options);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}

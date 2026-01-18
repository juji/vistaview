import { useEffect, useRef, useId, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaOpt } from 'vistaview';

export interface VistaViewProps {
  children: ReactNode;
  selector?: string;
  options?: VistaOpt;
  vistaRef?: React.Ref<VistaInterface>;
  ref?: React.Ref<HTMLDivElement>;
}

export function VistaView({ children, selector = '> a', options, id, ref, vistaRef, ...rest }: VistaViewProps & React.HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VistaInterface | null>(null);
  const generatedId = useId();
  const galleryId = id || `vvw-gallery-${generatedId.replace(/:/g, '')}`;

  useImperativeHandle(vistaRef, () => instanceRef.current!, []);
  useImperativeHandle(ref, () => containerRef.current!, []);

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


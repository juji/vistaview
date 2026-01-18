import { useEffect, useRef, useId, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaOpt } from 'vistaview';

export interface VistaViewProps {
  children: ReactNode;
  selector?: string;
  options?: VistaOpt;
  ref?: React.Ref<VistaComponentRef>;
}

export type VistaComponentRef = { vistaView: VistaInterface | null; container: HTMLDivElement | null } | null;

export const VistaView = (function VistaView(
  { children, selector = '> a', options, id, ref, ...rest }: VistaViewProps & React.HTMLAttributes<HTMLDivElement>
) {
  const containerRefInner = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<VistaInterface | null>(null);
  const generatedId = useId();
  const galleryId = id || `vvw-gallery-${generatedId.replace(/:/g, '')}`;

  // expose { vistaView, container } on the component ref
  useImperativeHandle(ref as React.Ref<VistaComponentRef>, () => ({
    vistaView: instanceRef.current,
    container: containerRefInner.current,
  }), []);

  useEffect(() => {
    if (!containerRefInner.current) return;

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
    <div ref={el => { containerRefInner.current = el }} {...rest} id={galleryId}>
      {children}
    </div>
  );
});


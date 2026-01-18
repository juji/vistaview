import { useEffect, useRef, useId, useImperativeHandle, forwardRef } from 'react';
import type { ReactNode } from 'react';
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaOpt } from 'vistaview';

export interface VistaViewProps {
  children: ReactNode;
  selector?: string;
  options?: VistaOpt;
  // legacy callback or ref to the API instance
  vistaRef?: React.Ref<VistaInterface>;
  // legacy prop to receive the container DOM node
  containerRef?: React.Ref<HTMLDivElement>;
}

export type VistaComponentRef = { vistaView: VistaInterface | null; container: HTMLDivElement | null } | null;

export const VistaView = forwardRef<VistaComponentRef, VistaViewProps & React.HTMLAttributes<HTMLDivElement>>(function VistaView({ children, selector = '> a', options, id, containerRef, vistaRef, ...rest }, ref) {
  const containerRefInner = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<VistaInterface | null>(null);
  const generatedId = useId();
  const galleryId = id || `vvw-gallery-${generatedId.replace(/:/g, '')}`;

  // maintain legacy API: separate refs/callbacks
  useImperativeHandle(vistaRef as React.Ref<VistaInterface>, () => instanceRef.current!, []);

  useEffect(() => {
    if (containerRefInner.current === null) return;
    if (!containerRef) return;
    // set containerRef prop to DOM node (supports function and ref object)
    if (typeof containerRef === 'function') containerRef(containerRefInner.current);
    else (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = containerRefInner.current;
  }, [containerRefInner.current]);

  // expose { vistaView, container } on the component ref
  useImperativeHandle(ref as React.Ref<VistaComponentRef>, () => ({
    vistaView: instanceRef.current,
    container: containerRefInner.current,
  }), [instanceRef.current, containerRefInner.current]);

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


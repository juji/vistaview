import { defineComponent, onMounted, onUnmounted, ref, h, type PropType } from 'vue';
import { vistaView } from './vistaview';
import type { VistaParams, VistaInterface, VistaOpt } from './vistaview';

export function useVistaView(options: VistaParams): VistaInterface {
  let instance: VistaInterface | null = null;

  onMounted(() => {
    instance = vistaView(options);
  });

  onUnmounted(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    open: (i?: number) => instance?.open(i),
    close: () => instance?.close() ?? Promise.resolve(),
    reset: () => instance?.reset(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    zoomIn: () => instance?.zoomIn(),
    zoomOut: () => instance?.zoomOut(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
    destroy: () => instance?.destroy(),
  };
}

export interface VistaViewProps {
  selector?: string;
  options?: VistaOpt;
}

export const VistaView = defineComponent({
  name: 'VistaView',
  inheritAttrs: false,
  props: {
    selector: {
      type: String,
      default: '> a',
    },
    options: Object as PropType<VistaOpt>,
  },
  setup(props, { slots, expose, attrs }) {
    const containerRef = ref<HTMLElement | null>(null);
    const instanceRef = ref<VistaInterface | null>(null);
    const galleryId = attrs.id || `vvw-gallery-${Math.random().toString(36).substr(2, 9)}`;

    onMounted(() => {
      if (!containerRef.value) return;

      instanceRef.value = vistaView({
        ...props.options,
        elements: `#${galleryId} ${props.selector}`,
      });
    });

    onUnmounted(() => {
      instanceRef.value?.destroy();
      instanceRef.value = null;
    });

    expose({
      get instance() {
        return instanceRef.value;
      },
    });

    return () =>
      h(
        'div',
        {
          ref: containerRef,
          ...attrs,
          id: galleryId,
        },
        slots.default?.()
      );
  },
});

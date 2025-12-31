import { defineComponent, onMounted, onUnmounted, ref, h, type PropType } from 'vue';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface, VistaOpt } from './vistaview';

export function useVistaView(options: VistaParamsNeo): VistaInterface {
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

export interface VistaViewProps extends VistaOpt {
  id?: string;
  class?: string;
  selector?: string;
}

export const VistaView = defineComponent({
  name: 'VistaView',
  props: {
    id: String,
    class: String,
    selector: {
      type: String,
      default: '> a',
    },
    elements: String,
    extensions: Array as PropType<VistaParamsNeo['extensions']>,
    closeOnScroll: Boolean,
    history: Boolean,
  },
  setup(props, { slots, expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const instanceRef = ref<VistaInterface | null>(null);
    const galleryId = props.id || `vvw-gallery-${Math.random().toString(36).substr(2, 9)}`;

    onMounted(() => {
      if (!containerRef.value) return;

      const { id, class: className, selector, ...options } = props;

      instanceRef.value = vistaView({
        ...options,
        elements: options.elements || `#${galleryId} ${selector}`,
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
          id: galleryId,
          class: props.class,
        },
        slots.default?.()
      );
  },
});

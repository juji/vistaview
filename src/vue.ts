import { onMounted, onUnmounted, ref, defineComponent, h, type PropType } from 'vue';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface } from './vistaview';

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
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    zoomIn: () => instance?.zoomIn(),
    zoomOut: () => instance?.zoomOut(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
    destroy: () => instance?.destroy(),
  };
}

export const VistaView = defineComponent({
  name: 'VistaView',
  props: {
    selector: {
      type: String as PropType<string>,
      required: true,
    },
    class: String,
  },
  setup(props, { slots, attrs }) {
    const container = ref<HTMLElement | null>(null);
    let instance: VistaInterface | null = null;

    onMounted(() => {
      if (!container.value) return;
      if (!props.selector) throw new Error('VistaView: selector is required');
      const containerId = `vvw-container-${Math.random().toString(36).substring(7)}`;
      container.value.id = containerId;
      const fullSelector = `#${containerId} ${props.selector}`;
      instance = vistaView({
        ...attrs,
        elements: fullSelector,
      } as VistaParamsNeo);
    });

    onUnmounted(() => {
      instance?.destroy();
      instance = null;
    });

    return () => h('div', { ref: container, class: props.class }, slots.default?.());
  },
});

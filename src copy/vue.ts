import { onMounted, onUnmounted, ref, defineComponent, h, type PropType } from 'vue';
import { vistaView } from './vistaview';
import type { VistaParams, VistaInterface, VistaImg } from './vistaview';

export type { VistaParams, VistaInterface, VistaImg };

export function useVistaView(options: VistaParams) {
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
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
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
      instance = vistaView({
        ...attrs,
        elements: container.value.querySelectorAll(props.selector),
      } as VistaParams);
    });

    onUnmounted(() => {
      instance?.destroy();
      instance = null;
    });

    return () => h('div', { ref: container, class: props.class }, slots.default?.());
  },
});

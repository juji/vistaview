import type { VistaExtension, VistaView } from 'vistaview';

export function selectBox({
  onSelect,
  selection,
  placeholder = 'Select an option',
}: {
  onSelect: (value: string) => void | Promise<void>;
  selection: { value: string; text?: string }[];
  placeholder?: string;
}): VistaExtension {
  let container: HTMLDivElement | null = null;

  return {
    name: 'selectBox',
    control: () => {
      container = document.createElement('div');
      container.classList.add('vvw-select-box');

      const select = document.createElement('select');
      select.classList.add('vvw-select-box-select');

      const firstOption = document.createElement('option');
      firstOption.value = '';
      firstOption.textContent = placeholder;
      firstOption.disabled = true;
      firstOption.selected = true;
      select.appendChild(firstOption);

      selection.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.text || item.value;
        select.appendChild(option);
      });

      select.addEventListener('change', async (e) => {
        const target = e.target as HTMLSelectElement;
        const value = target.value;
        await onSelect(value);
      });

      container.appendChild(select);
      return container;
    },
    onClose(_vistaView: VistaView) {
      // cleanup
      container && container.remove();
    },
  };
}

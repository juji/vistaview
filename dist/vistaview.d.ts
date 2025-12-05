import { VistaViewImage } from './lib/VistaView';
export type VistaViewOptions = {
    parent?: HTMLElement;
    elements?: string | NodeListOf<HTMLElement> | VistaViewImage[];
};
export type VistaViewMethods = {
    open: (index?: number) => void;
    close: () => void;
    view: (index: number) => void;
    next: () => void;
    prev: () => void;
    destroy: () => void;
    getCurrentIndex: () => number;
};
export declare function vistaView(options: VistaViewOptions): VistaViewMethods;
//# sourceMappingURL=vistaview.d.ts.map
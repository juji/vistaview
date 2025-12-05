export type VistaViewElm = {
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
    objectFit?: string;
    borderRadius?: string;
    objectPosition?: string;
    overflow?: string;
};
export type VistaViewImage = {
    src: string;
    width: number;
    height: number;
    smallSrc?: string;
    anchorProps?: VistaViewElm;
    anchor?: HTMLAnchorElement;
    imageProps?: VistaViewElm;
    image?: HTMLImageElement;
};
export declare class VistaView {
    private elements;
    private currentIndex;
    constructor(elements: VistaViewImage[]);
    open(index?: number): void;
    close(): void;
    view(index: number): void;
    next(): void;
    prev(): void;
    getCurrentIndex(): number;
    destroy(): void;
}
//# sourceMappingURL=VistaView.d.ts.map
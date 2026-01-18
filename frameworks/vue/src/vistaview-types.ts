import type { VistaOpt, VistaInterface } from 'vistaview';

export interface VistaViewProps {
  selector?: string;
  options?: VistaOpt;
  id?: string;
}

export type VistaComponentRef = { vistaView: VistaInterface | null; container: HTMLElement | null } | null;

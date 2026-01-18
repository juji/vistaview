import type { VistaInterface, VistaOpt } from 'vistaview';

export interface VistaViewProps {
  selector?: string;
  options?: VistaOpt;
  id?: string;
  vistaRef?: (obj: { vistaView: VistaInterface | null; container: HTMLElement | null } | null) => void;
}

export type VistaComponentRef = { vistaView: VistaInterface | null; container: HTMLElement | null } | null;

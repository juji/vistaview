import type { VistaInterface as _VI, VistaOpt as _VO, VistaParams as _VP } from '../../main/src/lib/types';

declare module 'vistaview' {
  export function vistaView(options: _VP): _VI | null;
  export type VistaOpt = _VO;
  export type VistaInterface = _VI;
  export type VistaParams = _VP;
}

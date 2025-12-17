import { clamp, limitPrecision } from './utils';

export type VistaCurrImg = {};

export class VistaImageState {
  private maxZoomLevel: number;

  constructor(maxZoomLevel: number) {
    this.maxZoomLevel = maxZoomLevel;
  }

  public getZoomLevel(zoom: number): number {
    return clamp(limitPrecision(zoom, 2), 1, this.maxZoomLevel);
  }
}


import './style.css';

type VistaViewOptions = {

  parent?: HTMLElement;
  elements?: HTMLElement[];

  backgroundColor?: string;
  zIndex?: number;
  style?: {
    foregroundColor?: string;
    borderRadius?: string;
    backgroundColor?: string;
    backgroundBlur?: string;
    backgroundOpacity?: number;
    buttonColor?: string;
  }
}

export function vistaView( options: VistaViewOptions ): void {
  console.log(`Hello, from VistaView!`);
  console.log(options);
}
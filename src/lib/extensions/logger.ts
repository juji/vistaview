import type { VistaData, VistaExtension, VistaImageClone, VistaImageParams } from '../types';
import type { VistaView } from '../vista-view';

// logger
// async as example

export function logger(): VistaExtension {
  return {
    name: 'logger',
    onInitializeImage: (params: VistaImageParams) => {
      console.debug('Logger: VistaView initialized with params:');
      console.debug(params);
    },
    onContentChange: (_content: VistaImageClone, _v: VistaView) => {
      console.debug('Logger: Content changed');
      console.debug(_content);
    },
    onImageView: async (vistaData: VistaData, _v: VistaView) => {
      console.debug('Logger: Image viewed');
      console.debug(vistaData);
    },
    onOpen: async (_vistaView: VistaView) => {
      console.debug('Logger: VistaView opened');
      console.debug(_vistaView);
    },
    onClose: (_vistaView: VistaView) => {
      console.debug('Logger: VistaView closed');
      console.debug(_vistaView);
    },
  };
}

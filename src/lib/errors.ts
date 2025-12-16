export class VistaIgnoredErr extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VistaIgnoredErr';
  }
}

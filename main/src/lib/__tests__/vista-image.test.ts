import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VistaImage } from '../vista-image'
import type { VistaImageParams } from '../types'

function makeParams(overrides: Partial<VistaImageParams> = {}): VistaImageParams {
  return {
    elm: {
      config: { src: 'https://example.com/photo.jpg', alt: 'Photo' },
      parsedSrcSet: [
        { src: '/small.jpg', width: 400 },
        { src: '/large.jpg', width: 1200 },
      ],
      origin: {
        image: document.createElement('img'),
        src: 'https://example.com/photo.jpg',
        srcSet: '',
        borderRadius: '0px',
        objectFit: 'cover',
      },
    },
    pos: 0,
    index: 0,
    maxZoomLevel: 3,
    vistaView: {
      options: { onContentChange: vi.fn() },
      state: { extensions: [] },
    } as any,
    onScale: vi.fn(),
    ...overrides,
  }
}

describe('VistaImage', () => {
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, 'decode').mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates an img element on construct', () => {
    const img = new VistaImage(makeParams())
    expect(img.element).toBeInstanceOf(HTMLImageElement)
    expect(img.element.classList.contains('vvw-img-hi')).toBe(true)
    expect(img.element.alt).toBe('Photo')
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('sets src from config', () => {
    const img = new VistaImage(makeParams())
    expect(img.element.src).toContain('photo.jpg')
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('onLoad sets dimensions and resolves isLoaded', async () => {
    const img = new VistaImage(makeParams())
    Object.defineProperties(img.element, {
      naturalWidth: { value: 1920, writable: true },
      naturalHeight: { value: 1080, writable: true },
    })

    img['onLoad']()

    await img['isLoaded']
    expect(img.fullW).toBeGreaterThan(0)
    expect(img.fullH).toBeGreaterThan(0)
    expect(img.minW).toBe(img.fullW * 0.5)
    expect(img.maxW).toBe(1920 * 3)
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('normalize extends base class and sets object-fit and border-radius', () => {
    const img = new VistaImage(makeParams())
    img.element.style.objectFit = ''
    img.element.style.borderRadius = ''

    img.element.classList.add('vvw--loaded')
    img['normalize']()

    expect(img.state.transform).toEqual({ x: 0, y: 0, scale: 1 })
    expect(img.element.style.objectFit).toBe('cover')
    expect(img.element.style.borderRadius).toBe('0px')
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('scaleMove applies transform when ready', () => {
    const img = new VistaImage(makeParams())
    img.isReady = true
    img.fullW = 800
    img.fullH = 600
    img.state.width = 400
    img.state.height = 300

    img.scaleMove(1.5)

    expect(img.state.transform.scale).toBe(1.5)
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('scaleMove does nothing when not ready', () => {
    const img = new VistaImage(makeParams())
    img.isReady = false
    img.scaleMove(1.5)
    expect(img.state.transform.scale).toBe(1)
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('animateZoom returns early when width * factor < minW', () => {
    const img = new VistaImage(makeParams())
    img.state.width = 100
    img.minW = 200
    img.animateZoom(1.5)
    expect(img.state.transform.scale).toBe(1)
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('prepareClose stops transition and finalizes', () => {
    const img = new VistaImage(makeParams())
    img.isReady = true
    img.state.width = 400
    img.state.height = 300
    img.fullW = 800
    img.fullH = 600

    img.prepareClose()

    expect(img.state.transform).toEqual({ x: 0, y: 0, scale: 1 })
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('cancelPendingLoad sets cancelled flag and class', () => {
    const img = new VistaImage(makeParams())
    img.cancelPendingLoad()
    expect(img.isCancelled).toBe(true)
    expect(img.element.classList.contains('vvw--load-cancelled')).toBe(true)
    img.element.remove()
  })

  it('getFromParsedSrcSet picks first entry >= target * DPR', () => {
    const img = new VistaImage(makeParams())
    const result = img['getFromParsedSrcSet'](800)
    expect(result).toBe('/large.jpg')
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('theThrow returns noop when not ready', () => {
    const img = new VistaImage(makeParams())
    img.isReady = false
    const cleanup = img.theThrow({ x: 10, y: 10 })
    expect(cleanup).toEqual(expect.any(Function))
    img.cancelPendingLoad()
    img.element.remove()
  })

  it('theThrow returns noop when not throwing', () => {
    const img = new VistaImage(makeParams())
    img.isReady = true
    img.isThrowing = false
    const cleanup = img.theThrow({ x: 10, y: 10 })
    expect(cleanup).toEqual(expect.any(Function))
    img.cancelPendingLoad()
    img.element.remove()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VistaBox } from '../vista-box'
import type { VistaImageParams } from '../types'

class TestVistaBox extends VistaBox {
  element: HTMLImageElement

  constructor(overrides: Partial<VistaImageParams> = {}) {
    const elm = document.createElement('img')
    elm.classList.add('vvw-img-hi')
    const defaults: VistaImageParams = {
      elm: {
        config: { src: 'https://example.com/photo.jpg', alt: 'Photo' },
        parsedSrcSet: [
          { src: '/small.jpg', width: 400 },
          { src: '/medium.jpg', width: 800 },
          { src: '/large.jpg', width: 1200 },
        ],
        origin: {
          image: document.createElement('img'),
          src: 'https://example.com/photo.jpg',
          srcSet: '',
          borderRadius: '4px',
          objectFit: 'cover',
        },
      },
      pos: -2,
      index: 0,
      maxZoomLevel: 3,
      vistaView: {
        options: { onContentChange: vi.fn() },
        state: { extensions: [] },
      } as any,
      onScale: vi.fn(),
    }
    super({ ...defaults, ...overrides })
    this.element = document.createElement('img')
  }
}

describe('VistaBox', () => {
  it('creates state with default values', () => {
    const vb = new TestVistaBox()
    expect(vb.state._width).toBe(0)
    expect(vb.state._height).toBe(0)
    expect(vb.state._transform).toEqual({ x: 0, y: 0, scale: 1 })
    expect(vb.state._translate).toEqual({ x: 0, y: 0 })
    expect(vb.state._lessThanMinWidth).toBe(false)
  })

  it('normalize resets transform, translate, dimensions and zoomedIn', () => {
    const vb = new TestVistaBox()
    vb.fullW = 800
    vb.fullH = 600
    vb.state.width = 400
    vb.state.height = 300
    vb.state.transform = { x: 50, y: 25, scale: 1.5 }
    vb.state.translate = { x: 100, y: 50 }
    vb.isZoomedIn = true

    vb['normalize']()

    expect(vb.state.transform).toEqual({ x: 0, y: 0, scale: 1 })
    expect(vb.state.translate).toEqual({ x: 0, y: 0 })
    expect(vb.state.width).toBe(800)
    expect(vb.state.height).toBe(600)
    expect(vb.isZoomedIn).toBe(false)
  })

  it('cancelPendingLoad sets cancelled and adds CSS class', () => {
    const vb = new TestVistaBox()
    vb.cancelPendingLoad()
    expect(vb.isCancelled).toBe(true)
    expect(vb.element.classList.contains('vvw--load-cancelled')).toBe(true)
  })

  it('destroy cleans up DOM and resets references', () => {
    const vb = new TestVistaBox()
    const thumb = document.createElement('div')
    thumb.classList.add('vvw-img-lo')
    document.body.appendChild(thumb)
    vb.thumb = thumb
    vb.thumbImage = document.createElement('img')
    vb.originalParent = document.createElement('div')
    vb.thumbImage.style.cssText = 'width:100px'
    vb.originalParent.appendChild(vb.thumbImage)
    document.body.appendChild(vb.originalParent)
    document.body.appendChild(vb.element)

    vb.destroy()

    expect(vb.originalParent).toBeNull()
    expect(vb.thumb).toBeNull()
    expect(vb.thumbImage).toBeNull()
    expect(vb.origin).toBeUndefined()
    expect(vb.config).toEqual({ src: '', alt: '' })
  })

  it('cloneStyleFrom copies state from another VistaBox', () => {
    const vb = new TestVistaBox()
    const other = new TestVistaBox()
    other.element.classList.add('vvw--loaded')
    other.element.classList.add('vvw--ready')
    other.state.width = 500
    other.state.height = 400

    vb.cloneStyleFrom(other)

    expect(vb.element.classList.contains('vvw--loaded')).toBe(true)
    expect(vb.element.classList.contains('vvw--ready')).toBe(true)
    expect(vb.state.width).toBe(500)
    expect(vb.state.height).toBe(400)
  })

  it('cloneStyleFrom passes transitionState', () => {
    const vb = new TestVistaBox()
    const other = new TestVistaBox()
    const state = {
      current: { width: 300, height: 200 },
      target: { width: 600, height: 400 },
      log: [],
    }
    vb.cloneStyleFrom(other, state as any)
    expect(vb.transitionState).toEqual(state)
  })

  it('toObject serializes state', () => {
    const vb = new TestVistaBox()
    vb.state.width = 800
    vb.state.height = 600
    vb.state.transform = { x: 0, y: 0, scale: 1 }
    vb.state.translate = { x: 0, y: 0 }

    const obj = vb.toObject()
    expect(obj.config.src).toBe('https://example.com/photo.jpg')
    expect(obj.config.alt).toBe('Photo')
    expect(obj.state.width).toBe(800)
    expect(obj.state.height).toBe(600)
    expect(obj.parsedSrcSet).toHaveLength(3)
  })

  it('setFinalTransform propogates to translate and width/height', () => {
    const vb = new TestVistaBox()
    vb.isReady = true
    vb.state.width = 800
    vb.state.height = 600
    vb.state.transform = { x: 100, y: 50, scale: 2 }
    vb.state.translate = { x: 10, y: 5 }
    vb.fullW = 1600
    vb.fullH = 1200
    vb.minW = 1600 * 0.5

    const result = vb.setFinalTransform()

    expect(vb.state.translate.x).toBe(110)
    expect(vb.state.translate.y).toBe(55)
    expect(vb.state.width).toBe(1600)
    expect(vb.state.height).toBe(1200)
    expect(vb.state.transform).toEqual({ x: 0, y: 0, scale: 1 })
    // VistaBox.setFinalTransform always returns close: true; VistaImage overrides this
    expect(result).toEqual({ close: true, cancel: expect.any(Function) })
  })

  it('setFinalTransform returns close true for base class', () => {
    const vb = new TestVistaBox()
    vb.isReady = true
    const result = vb.setFinalTransform()
    expect(result.close).toBe(true)
  })

  it('setFinalTransform is noop when not ready', () => {
    const vb = new TestVistaBox()
    expect(vb.setFinalTransform()).toBeUndefined()
  })

  it('getFromParsedSrcSet returns null when no parsedSrcSet', () => {
    const vb = new TestVistaBox()
    vb.parsedSrcSet = undefined
    expect(vb['getFromParsedSrcSet'](800)).toBeNull()
  })

  it('getFromParsedSrcSet returns best match considering DPR', () => {
    const vb = new TestVistaBox()
    const result = vb['getFromParsedSrcSet'](800)
    expect(result).toBe('/medium.jpg')
  })

  it('getFromParsedSrcSet returns largest when all entries smaller than target', () => {
    const vb = new TestVistaBox()
    const result = vb['getFromParsedSrcSet'](99999)
    expect(result).toBe('/large.jpg')
  })

  it('setSizes returns early when no origin', () => {
    const vb = new TestVistaBox()
    const elm = { config: { src: 'test.jpg' }, parsedSrcSet: undefined, origin: undefined }
    Object.assign(vb, { origin: undefined })
    vb.setSizes()
  })
})

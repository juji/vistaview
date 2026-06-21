import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VistaView } from '../vista-view'
import type { VistaExtension } from '../types'

vi.mock('../components', () => ({
  vistaViewComponent: vi.fn(() => {
    const root = document.createElement('div')
    root.id = 'vvw-root'
    root.innerHTML = `
      <div class="vvw-container">
        <div class="vvw-bg"></div>
        <div class="vvw-image-container"></div>
        <div class="vvw-top-bar"><div></div><div></div><div></div></div>
        <div class="vvw-bottom-bar"><div></div><div></div><div></div></div>
        <div class="vvw-prev vvw-ui"><button aria-label="Previous"></button></div>
        <div class="vvw-next vvw-ui"><button aria-label="Next"></button></div>
        <button class="vvw-close"></button>
        <button class="vvw-zoom-in"></button>
        <button class="vvw-zoom-out" disabled></button>
        <div class="vvw-index"></div>
        <div class="vvw-desc"></div>
      </div>`
    return root
  }),
}))

vi.mock('../vista-image', () => ({
  VistaImage: vi.fn().mockImplementation((par: any) => ({
    config: par.elm.config,
    index: par.index,
    pos: par.pos,
    element: Object.assign(document.createElement('img'), {
      className: 'vvw-img-hi',
      src: par.elm.config.src,
    }),
    state: {
      width: 800,
      height: 600,
      transform: { x: 0, y: 0, scale: 1 },
      translate: { x: 0, y: 0 },
    },
    isReady: true,
    thumb: null,
    init: vi.fn(),
    destroy: vi.fn(),
    cancelPendingLoad: vi.fn(),
    prepareClose: vi.fn(),
    animateZoom: vi.fn(),
    cloneStyleFrom: vi.fn(),
    setSizes: vi.fn(),
    fullW: 800,
    minW: 400,
  })),
}))

vi.mock('../vista-image-event', () => ({
  VistaImageEvent: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    registerPointerListener: vi.fn(),
  })),
}))

vi.mock('../defaults/init', () => ({ init: vi.fn() }))
vi.mock('../defaults/open', () => ({ open: vi.fn() }))
vi.mock('../defaults/close', () => ({ close: vi.fn() }))
vi.mock('../defaults/transition', () => ({
  transition: vi.fn(() => ({
    cleanup: vi.fn(),
    transitionEnded: Promise.resolve(),
  })),
}))
vi.mock('../utils/parse-element', () => ({
  parseElement: vi.fn(() => ({
    config: { src: 'https://example.com/img.jpg', alt: '' },
    parsedSrcSet: undefined,
    origin: undefined,
  })),
}))

describe('VistaView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'requestAnimationFrame',
      (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 16)
    )
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false }))
    )
    vi.stubGlobal('performance', {
      now: vi.fn(() => Date.now()),
      timeOrigin: 0,
    } as any)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  function createImgElements(count = 3): HTMLImageElement[] {
    return Array.from({ length: count }, (_, i) => {
      const img = new Image()
      img.src = `photo${i}.jpg`
      img.alt = `Photo ${i}`
      document.body.appendChild(img)
      return img
    })
  }

  describe('constructor', () => {
    it('sets options with defaults merged', () => {
      const vv = new VistaView(createImgElements())
      expect(vv.options.animationDurationBase).toBe(333)
      expect(vv.options.maxZoomLevel).toBe(2)
      expect(vv.options.keyboardListeners).toBe(true)
    })

    it('merges custom options over defaults', () => {
      const vv = new VistaView(createImgElements(), { maxZoomLevel: 5, keyboardListeners: false })
      expect(vv.options.maxZoomLevel).toBe(5)
      expect(vv.options.keyboardListeners).toBe(false)
      expect(vv.options.animationDurationBase).toBe(333)
    })

    it('registers extensions', () => {
      const ext: VistaExtension = { name: 'test-ext' }
      const vv = new VistaView(createImgElements(), { extensions: [ext] })
      expect(vv.state.extensions.has(ext)).toBe(true)
    })

    it('detects reduced motion preference', () => {
      vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
      const vv = new VistaView(createImgElements())
      expect(vv.state.isReducedMotion).toBe(true)
    })
  })

  describe('open', () => {
    it('appends root to body and sets currentIndex', () => {
      const vv = new VistaView(createImgElements())
      vv.open(0)
      vi.runAllTimers()
      expect(document.body.querySelector('#vvw-root')).toBeTruthy()
      expect(vv.state.currentIndex).toBe(0)
      vv.destroy()
    })

    it('prevents body scrolling', () => {
      const vv = new VistaView(createImgElements())
      vv.open(0)
      vi.runAllTimers()
      expect(document.body.style.overflow).toBe('hidden')
      vv.destroy()
    })

    it('returns early if another instance is already opened', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const vv1 = new VistaView(createImgElements())
      const vv2 = new VistaView(createImgElements(2))
      vv1.open(0)
      vi.runAllTimers()
      vv2.open(0)
      vi.runAllTimers()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('already opened'))
      warn.mockRestore()
      vv1.destroy()
    })
  })

  describe('close', () => {
    it('removes root from DOM and restores body scroll', async () => {
      const vv = new VistaView(createImgElements())
      vv.open(0)
      vi.runAllTimers()

      const closePromise = vv.close(true)

      // Fire transitionend events (close waits for 3 on the root)
      const root = document.querySelector('#vvw-root')!
      for (let i = 0; i < 3; i++) {
        root.dispatchEvent(new TransitionEvent('transitionend', { target: root, bubbles: true }))
      }

      await closePromise

      expect(document.body.querySelector('#vvw-root')).toBeFalsy()
      expect(document.body.style.overflow).toBe('')
    })
  })

  describe('destroy', () => {
    it('removes root and clears external listeners', () => {
      const vv = new VistaView(createImgElements())
      vv.open(0)
      vi.runAllTimers()
      vv.destroy()
      expect(document.body.querySelector('#vvw-root')).toBeFalsy()
    })
  })

  describe('navigation', () => {
    it('next advances to next index', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(0)
      vi.runAllTimers()
      vv.next()
      expect(vv.state.currentIndex).toBe(1)
      vv.destroy()
    })

    it('next wraps from last to first', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(2)
      vi.runAllTimers()
      vv.next()
      expect(vv.state.currentIndex).toBe(0)
      vv.destroy()
    })

    it('prev goes to previous index', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(1)
      vi.runAllTimers()
      vv.prev()
      expect(vv.state.currentIndex).toBe(0)
      vv.destroy()
    })

    it('prev wraps from first to last', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(0)
      vi.runAllTimers()
      vv.prev()
      expect(vv.state.currentIndex).toBe(2)
      vv.destroy()
    })

    it('view navigates to specific index', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(0)
      vi.runAllTimers()
      vv.view(2)
      expect(vv.state.currentIndex).toBe(2)
      vv.destroy()
    })
  })

  describe('zoom', () => {
    it('zoomIn calls animateZoom on center image', () => {
      const vv = new VistaView(createImgElements())
      vv.open(0)
      vi.runAllTimers()
      vv.zoomIn()
      const center = vv.state.children.images.find((i: any) => i.pos === 0)
      expect(center?.animateZoom).toHaveBeenCalled()
      vv.destroy()
    })

    it('getCurrentIndex returns current index', () => {
      const vv = new VistaView(createImgElements(3))
      vv.open(1)
      vi.runAllTimers()
      expect(vv.getCurrentIndex()).toBe(1)
      vv.destroy()
    })
  })
})

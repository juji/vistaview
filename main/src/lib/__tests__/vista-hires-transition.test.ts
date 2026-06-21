import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { VistaHiresTransition } from '../vista-hires-transition'
import type { VistaBox } from '../vista-box'

function advanceFrames(n: number) {
  for (let i = 0; i < n; i++) {
    vi.advanceTimersByTime(16)
  }
}

function makeVistaBox(): VistaBox {
  const el = document.createElement('img')
  el.classList.add('vvw-img-hi')
  const state = {
    _t: null as any,
    _width: 200,
    _height: 150,
    _transform: { x: 0, y: 0, scale: 1 },
    _translate: { x: 0, y: 0 },
    _lessThanMinWidth: false,
    get width() { return state._width },
    set width(v: number) { state._width = v },
    get height() { return state._height },
    set height(v: number) { state._height = v },
    get transform() { return state._transform },
    set transform(v: { x: number; y: number; scale: number }) { state._transform = v },
    get translate() { return state._translate },
    set translate(v: { x: number; y: number }) { state._translate = v },
    get lessThanMinWidth() { return state._lessThanMinWidth },
    set lessThanMinWidth(v: boolean) { state._lessThanMinWidth = v },
  }
  return { element: el, state } as unknown as VistaBox
}

describe('VistaHiresTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 16)
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('animates width and height towards target', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { width: 400, height: 300 },
      onComplete,
      shouldWait: () => false,
    })

    advanceFrames(60)

    expect(vb.state.width).toBeGreaterThan(200)
    expect(vb.state.height).toBeGreaterThan(150)
    expect(onComplete).toHaveBeenCalled()
  })

  it('calls onComplete when target equals current', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { width: 200, height: 150 },
      onComplete,
      shouldWait: () => false,
    })

    advanceFrames(5)

    expect(onComplete).toHaveBeenCalled()
  })

  it('stops animation when stop is called', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { width: 400, height: 300 },
      onComplete,
      shouldWait: () => false,
    })

    VistaHiresTransition.stop(vb)
    advanceFrames(30)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('waits when shouldWait returns true', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()
    let shouldWait = true

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { width: 400, height: 300 },
      onComplete,
      shouldWait: () => shouldWait,
    })

    advanceFrames(5)
    expect(onComplete).not.toHaveBeenCalled()

    shouldWait = false
    advanceFrames(60)
    expect(onComplete).toHaveBeenCalled()
  })

  it('stops on cancelled class', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { width: 400, height: 300 },
      onComplete,
      shouldWait: () => false,
    })

    vb.element.classList.add('vvw--load-cancelled')
    advanceFrames(30)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('animates transform values', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { transform: { x: 100, y: 50, scale: 2 } },
      onComplete,
      shouldWait: () => false,
    })

    advanceFrames(60)

    expect(vb.state.transform.x).toBeGreaterThan(0)
    expect(vb.state.transform.y).toBeGreaterThan(0)
    expect(vb.state.transform.scale).toBeGreaterThan(1)
  })

  it('animates translate values', () => {
    const vb = makeVistaBox()
    const onComplete = vi.fn()

    VistaHiresTransition.start({
      vistaImage: vb,
      target: { translate: { x: 50, y: -30 } },
      onComplete,
      shouldWait: () => false,
    })

    advanceFrames(60)

    expect(vb.state.translate.x).toBeGreaterThan(0)
    expect(vb.state.translate.y).toBeLessThan(0)
  })
})

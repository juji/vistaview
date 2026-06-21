import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getFittedSize } from '../../utils/get-fitted-size'

describe('getFittedSize', () => {
  const origGetComputedStyle = window.getComputedStyle

  function mockObjectFit(value: string) {
    window.getComputedStyle = ((_el: Element) => {
      const style = origGetComputedStyle(_el)
      Object.defineProperty(style, 'objectFit', {
        value,
        configurable: true,
      })
      return style
    }) as typeof window.getComputedStyle
  }

  afterAll(() => {
    window.getComputedStyle = origGetComputedStyle
  })

  function makeImg(
    nw: number, nh: number,
    objectFit: string,
    bw: number, bh: number
  ): HTMLImageElement {
    mockObjectFit(objectFit)
    const img = new Image()
    Object.defineProperties(img, {
      naturalWidth: { value: nw, writable: true },
      naturalHeight: { value: nh, writable: true },
    })
    Object.defineProperty(img, 'getBoundingClientRect', {
      value: () => ({
        width: bw, height: bh,
        top: 0, left: 0,
        right: bw, bottom: bh,
      }),
      configurable: true,
    })
    img.style.objectFit = objectFit
    return img
  }

  it('handles fill object-fit', () => {
    const img = makeImg(800, 600, 'fill', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 400, height: 300 })
  })

  it('handles none object-fit (uses natural size)', () => {
    const img = makeImg(800, 600, 'none', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 800, height: 600 })
  })

  it('handles contain with wider container', () => {
    const img = makeImg(400, 300, 'contain', 800, 600)
    expect(getFittedSize(img)).toEqual({ width: 800, height: 600 })
  })

  it('handles contain with narrower container', () => {
    const img = makeImg(800, 600, 'contain', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 400, height: 300 })
  })

  it('handles contain when image is portrait and container is landscape', () => {
    const img = makeImg(300, 400, 'contain', 800, 600)
    const result = getFittedSize(img)
    expect(result.width).toBe(450)
    expect(result.height).toBe(600)
  })

  it('handles cover with equal aspect ratios', () => {
    const img = makeImg(400, 300, 'cover', 800, 600)
    expect(getFittedSize(img)).toEqual({ width: 800, height: 600 })
  })

  it('handles cover with portrait image in landscape container', () => {
    const img = makeImg(300, 400, 'cover', 400, 300)
    const result = getFittedSize(img)
    expect(result.width).toBe(400)
    expect(result.height).toBeCloseTo(533, 0)
  })

  it('handles scale-down when natural is smaller', () => {
    const img = makeImg(200, 150, 'scale-down', 800, 600)
    expect(getFittedSize(img)).toEqual({ width: 200, height: 150 })
  })

  it('handles scale-down when contain is smaller', () => {
    const img = makeImg(1600, 1200, 'scale-down', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 400, height: 300 })
  })

  it('falls back to box size when object-fit is empty', () => {
    const img = makeImg(800, 600, '', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 400, height: 300 })
  })

  it('handles missing natural dimensions', () => {
    const img = makeImg(0, 0, 'contain', 400, 300)
    expect(getFittedSize(img)).toEqual({ width: 400, height: 300 })
  })
})

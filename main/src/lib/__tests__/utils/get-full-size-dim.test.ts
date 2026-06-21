import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { getFullSizeDim } from '../../utils/get-full-size-dim'

describe('getFullSizeDim', () => {
  const originalInnerWidth = window.innerWidth
  const originalInnerHeight = window.innerHeight

  beforeAll(() => {
    window.innerWidth = 1024
    window.innerHeight = 768
  })

  afterAll(() => {
    window.innerWidth = originalInnerWidth
    window.innerHeight = originalInnerHeight
  })

  function createImage(naturalWidth: number, naturalHeight: number): HTMLImageElement {
    const img = new Image()
    Object.defineProperties(img, {
      naturalWidth: { value: naturalWidth, writable: true },
      naturalHeight: { value: naturalHeight, writable: true },
    })
    return img
  }

  it('returns natural size when image is smaller than viewport', () => {
    const img = createImage(400, 300)
    const result = getFullSizeDim(img)
    expect(result.width).toBe(400)
    expect(result.height).toBe(300)
  })

  it('constrains by width when image is wider than viewport', () => {
    const img = createImage(2048, 768)
    const result = getFullSizeDim(img)
    expect(result.width).toBe(1024)
    expect(result.height).toBe(384)
  })

  it('constrains by height when image is taller than viewport', () => {
    const img = createImage(768, 1536)
    const result = getFullSizeDim(img)
    expect(result.width).toBe(384)
    expect(result.height).toBe(768)
  })

  it('handles square image larger than viewport', () => {
    const img = createImage(2000, 2000)
    const result = getFullSizeDim(img)
    expect(result.width).toBe(768)
    expect(result.height).toBe(768)
  })

  it('handles exact viewport size', () => {
    const img = createImage(1024, 768)
    const result = getFullSizeDim(img)
    expect(result.width).toBe(1024)
    expect(result.height).toBe(768)
  })

  it('throws on zero natural dimensions', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const img = createImage(0, 0)
    expect(() => getFullSizeDim(img)).toThrow('Image natural dimensions are zero')
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseElement } from '../utils/parse-element'

describe('parseElement', () => {
  beforeEach(() => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (() =>
        ({
          borderRadius: '0px',
          objectFit: 'cover',
        })) as unknown as typeof window.getComputedStyle
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('<img> element', () => {
    it('parses src from src attribute', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      const result = parseElement(img)
      expect(result.config.src).toBe('https://example.com/photo.jpg')
    })

    it('parses src from dataset', () => {
      const img = document.createElement('img')
      img.setAttribute('data-vistaview-src', 'https://dsrc/img.jpg')
      const result = parseElement(img)
      expect(result.config.src).toBe('https://dsrc/img.jpg')
    })

    it('parses srcSet from srcset attribute', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.setAttribute('srcset', 'https://example.com/photo-400w.jpg 400w, https://example.com/photo-800w.jpg 800w')
      const result = parseElement(img)
      expect(result.config.srcSet).toBe(
        'https://example.com/photo-400w.jpg 400w, https://example.com/photo-800w.jpg 800w'
      )
      expect(result.parsedSrcSet).toHaveLength(2)
      expect(result.parsedSrcSet![0]).toEqual({ src: 'https://example.com/photo-400w.jpg', width: 400 })
    })

    it('parses srcSet from dataset', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.setAttribute('data-vistaview-srcset', 'https://dsrc/400w.jpg 400w')
      const result = parseElement(img)
      expect(result.config.srcSet).toBe('https://dsrc/400w.jpg 400w')
    })

    it('parses alt from alt attribute', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.alt = 'A beautiful sunset'
      const result = parseElement(img)
      expect(result.config.alt).toBe('A beautiful sunset')
    })

    it('parses alt from dataset', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.setAttribute('data-vistaview-alt', 'Custom alt')
      const result = parseElement(img)
      expect(result.config.alt).toBe('Custom alt')
    })

    it('throws when no src or srcSet', () => {
      const img = document.createElement('img')
      expect(() => parseElement(img)).toThrow('VistaView: Element must have href, src, or srcSet')
    })
  })

  describe('<a> wrapper element', () => {
    it('parses href from anchor', () => {
      const anchor = document.createElement('a')
      anchor.href = 'https://example.com/large.jpg'
      const img = document.createElement('img')
      img.src = 'https://example.com/thumb.jpg'
      anchor.appendChild(img)
      const result = parseElement(anchor)
      expect(result.config.src).toBe('https://example.com/large.jpg')
    })

    it('falls back to img src when anchor has no href', () => {
      const anchor = document.createElement('a')
      const img = document.createElement('img')
      img.src = 'https://example.com/fallback.jpg'
      anchor.appendChild(img)
      const result = parseElement(anchor)
      expect(result.config.src).toBe('https://example.com/fallback.jpg')
    })

    it('throws when no href and no img', () => {
      const anchor = document.createElement('a')
      expect(() => parseElement(anchor)).toThrow('VistaView: Element must have href, src, or srcSet')
    })
  })

  describe('srcSet parsing', () => {
    it('parses valid srcset entries', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.setAttribute('srcset', '/small.jpg 200w, /medium.jpg 600w, /large.jpg 1200w')
      const result = parseElement(img)
      expect(result.parsedSrcSet).toEqual([
        { src: '/small.jpg', width: 200 },
        { src: '/medium.jpg', width: 600 },
        { src: '/large.jpg', width: 1200 },
      ])
    })

    it('returns undefined for empty srcset', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      const result = parseElement(img)
      expect(result.parsedSrcSet).toBeUndefined()
    })

    it('skips malformed entries', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      img.setAttribute('srcset', '/good.jpg 400w, /bad.jpg, /also-bad.jpg abc')
      const result = parseElement(img)
      expect(result.parsedSrcSet).toHaveLength(1)
      expect(result.parsedSrcSet![0]).toEqual({ src: '/good.jpg', width: 400 })
    })
  })

  describe('computed styles', () => {
    it('includes borderRadius and objectFit', () => {
      const img = document.createElement('img')
      img.src = 'https://example.com/photo.jpg'
      const result = parseElement(img)
      expect(result.origin?.borderRadius).toBe('0px')
      expect(result.origin?.objectFit).toBe('cover')
    })
  })
})

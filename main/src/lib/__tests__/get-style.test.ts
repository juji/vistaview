import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getStyle } from '../utils/get-style'

describe('getStyle', () => {
  beforeEach(() => {
    const mockStyles = new Map<string, string>()
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (el: Element) =>
        ({
          getPropertyValue(name: string) {
            return mockStyles.get(name) ?? ''
          },
          get borderRadius() {
            return mockStyles.get('border-radius') ?? '0px'
          },
          get objectFit() {
            return mockStyles.get('object-fit') ?? 'fill'
          },
        }) as CSSStyleDeclaration
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function setStyle(name: string, value: string) {
    const mock = window.getComputedStyle as ReturnType<typeof vi.fn>
    const impl = mock.getMockImplementation()!
    const styles = (impl as any)._styles ?? new Map()
    styles.set(name, value)
    ;(impl as any)._styles = styles
  }

  it('returns 0px borderRadius and objectFit from image when no anchor', () => {
    const img = document.createElement('img')
    const result = getStyle(img)
    expect(result.borderRadius).toBe('0px')
    expect(result.objectFit).toBe('fill')
  })

  it('returns anchor borderRadius when non-zero', () => {
    const anchor = document.createElement('a')
    const img = document.createElement('img')
    anchor.appendChild(img)

    const mock = window.getComputedStyle as ReturnType<typeof vi.fn>
    mock.mockImplementation((el: Element) => {
      const isA = el.tagName === 'A'
      return {
        get borderRadius() {
          return isA ? '8px' : '0px'
        },
        get objectFit() {
          return 'cover'
        },
      } as CSSStyleDeclaration
    })

    const result = getStyle(anchor)
    expect(result.borderRadius).toBe('8px')
  })

  it('falls back to image borderRadius when anchor borderRadius is zero', () => {
    const anchor = document.createElement('a')
    const img = document.createElement('img')
    anchor.appendChild(img)

    const mock = window.getComputedStyle as ReturnType<typeof vi.fn>
    mock.mockImplementation((el: Element) => {
      const isA = el.tagName === 'A'
      const isImg = el.tagName === 'IMG'
      return {
        get borderRadius() {
          if (isA) return '0px'
          if (isImg) return '4px'
          return '0px'
        },
        get objectFit() {
          return 'cover'
        },
      } as CSSStyleDeclaration
    })

    const result = getStyle(anchor)
    expect(result.borderRadius).toBe('4px')
  })

  it('returns default objectFit when there is no image', () => {
    const anchor = document.createElement('a')
    const mock = window.getComputedStyle as ReturnType<typeof vi.fn>
    mock.mockImplementation(() => ({
      get borderRadius() {
        return '0px'
      },
      get objectFit() {
        return ''
      },
    }) as CSSStyleDeclaration)

    const result = getStyle(anchor)
    expect(result.objectFit).toBe('contain')
  })
})

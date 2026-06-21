import { describe, it, expect, vi } from 'vitest'
import { open } from '../../defaults/open'

describe('defaults/open', () => {
  it('sets container width, left, and display styles from preloads', () => {
    const container = document.createElement('div')
    const vvw = {
      options: { preloads: 2 },
      imageContainer: container,
    } as any

    open(vvw)

    expect(container.style.width).toBe('500vw')
    expect(container.style.left).toBe('-200vw')
    expect(container.style.display).toBe('flex')
  })

  it('works with preloads of 0', () => {
    const container = document.createElement('div')
    const vvw = {
      options: { preloads: 0 },
      imageContainer: container,
    } as any

    open(vvw)

    expect(container.style.width).toBe('100vw')
    expect(container.style.left).toBe('0vw')
  })
})

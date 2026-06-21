import { describe, it, expect } from 'vitest'
import { removeStory } from './main'

describe('removeStory', () => {
  it('removes nothing when cache is within limit', () => {
    const cache = { '0': { content: 'a' }, '1': { content: 'b' } }
    removeStory('0', cache as any, 5)
    expect(Object.keys(cache)).toEqual(['0', '1'])
  })

  it('removes entries symmetrically when cache exceeds limit', () => {
    const cache: Record<string, any> = {}
    for (let i = 0; i < 10; i++) cache[String(i)] = { content: String(i) }

    removeStory('4', cache as any, 3)

    const remaining = Object.keys(cache).map(Number).sort((a, b) => a - b)
    expect(remaining.length).toBeLessThanOrEqual(4)
    expect(remaining).toContain(4)
  })

  it('keeps current index and up to maxStoryCache extra entries', () => {
    const cache: Record<string, any> = {}
    for (let i = 0; i < 10; i++) cache[String(i)] = { content: String(i) }

    removeStory('5', cache as any, 1)

    const remaining = Object.keys(cache)
    expect(remaining).toContain('5')
    expect(remaining.length).toBeLessThanOrEqual(2)
  })

  it('handles empty cache', () => {
    const cache = {}
    removeStory('0', cache as any, 5)
    expect(Object.keys(cache)).toEqual([])
  })
})

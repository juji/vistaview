import { describe, it, expect } from 'vitest'
import { parseStreamableVideoId, getStreamableThumbnail } from './main'

describe('parseStreamableVideoId', () => {
  it('extracts from streamable.com/ID', () => {
    expect(parseStreamableVideoId('https://streamable.com/abc123')).toBe('abc123')
  })
  it('extracts from streamable.com/e/ID', () => {
    expect(parseStreamableVideoId('https://streamable.com/e/abc123')).toBe('abc123')
  })
  it('returns null for invalid URL', () => {
    expect(parseStreamableVideoId('https://example.com')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseStreamableVideoId('')).toBeNull()
  })
})

describe('getStreamableThumbnail', () => {
  it('returns thumbnail URL', () => {
    expect(getStreamableThumbnail('https://streamable.com/abc123')).toBe(
      'https://cdn-cf-east.streamable.com/image/abc123.jpg'
    )
  })
  it('throws for invalid URL', () => {
    expect(() => getStreamableThumbnail('bad')).toThrow('Invalid Streamable video URL')
  })
})

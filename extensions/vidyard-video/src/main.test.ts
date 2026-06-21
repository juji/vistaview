import { describe, it, expect } from 'vitest'
import { parseVidyardVideoId, getVidyardThumbnail } from './main'

describe('parseVidyardVideoId', () => {
  it('extracts from video.vidyard.com', () => {
    expect(parseVidyardVideoId('https://video.vidyard.com/watch/abc123def')).toBe('abc123def')
  })
  it('extracts from play.vidyard.com', () => {
    expect(parseVidyardVideoId('https://play.vidyard.com/abc123def')).toBe('abc123def')
  })
  it('extracts from share.vidyard.com', () => {
    expect(parseVidyardVideoId('https://share.vidyard.com/watch/abc123def')).toBe('abc123def')
  })
  it('returns null for invalid URL', () => {
    expect(parseVidyardVideoId('https://example.com')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseVidyardVideoId('')).toBeNull()
  })
})

describe('getVidyardThumbnail', () => {
  it('returns thumbnail URL', () => {
    expect(getVidyardThumbnail('https://play.vidyard.com/abc123def')).toBe(
      'https://play.vidyard.com/abc123def.jpg'
    )
  })
  it('throws for invalid URL', () => {
    expect(() => getVidyardThumbnail('bad')).toThrow('Invalid Vidyard video URL')
  })
})

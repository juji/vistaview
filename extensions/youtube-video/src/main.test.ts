import { describe, it, expect } from 'vitest'
import { parseYouTubeVideoId, getYouTubeThumbnail } from './main'

describe('parseYouTubeVideoId', () => {
  it('extracts from watch URL', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from short youtu.be URL', () => {
    expect(parseYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from embed URL', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from live URL', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/live/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from shorts URL', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from mobile URL', () => {
    expect(parseYouTubeVideoId('https://m.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from /v/ URL', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('returns null for invalid URL', () => {
    expect(parseYouTubeVideoId('https://example.com')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseYouTubeVideoId('')).toBeNull()
  })

  it('returns null when no match found', () => {
    expect(parseYouTubeVideoId('not a url')).toBeNull()
  })
})

describe('getYouTubeThumbnail', () => {
  it('returns hq thumbnail by default', () => {
    const url = getYouTubeThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
  })

  it('returns maxres thumbnail when specified', () => {
    const url = getYouTubeThumbnail('https://youtu.be/dQw4w9WgXcQ', 'maxres')
    expect(url).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
  })

  it('throws for invalid URL', () => {
    expect(() => getYouTubeThumbnail('not a url')).toThrow('Invalid YouTube video URL')
  })
})

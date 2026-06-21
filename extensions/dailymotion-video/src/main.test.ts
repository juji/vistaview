import { describe, it, expect } from 'vitest'
import { parseDailymotionVideoId, getDailymotionThumbnail } from './main'

describe('parseDailymotionVideoId', () => {
  it('extracts from dailymotion.com/video', () => {
    expect(parseDailymotionVideoId('https://www.dailymotion.com/video/x7abcde')).toBe('x7abcde')
  })
  it('extracts from dai.ly short URL', () => {
    expect(parseDailymotionVideoId('https://dai.ly/x7abcde')).toBe('x7abcde')
  })
  it('extracts from embed URL', () => {
    expect(parseDailymotionVideoId('https://www.dailymotion.com/embed/video/x7abcde')).toBe('x7abcde')
  })
  it('returns null for invalid URL', () => {
    expect(parseDailymotionVideoId('https://example.com')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseDailymotionVideoId('')).toBeNull()
  })
})

describe('getDailymotionThumbnail', () => {
  it('returns thumbnail URL', () => {
    expect(getDailymotionThumbnail('https://www.dailymotion.com/video/x7abcde')).toBe(
      'https://www.dailymotion.com/thumbnail/video/x7abcde'
    )
  })
  it('throws for invalid URL', () => {
    expect(() => getDailymotionThumbnail('bad')).toThrow('Invalid Dailymotion video URL')
  })
})

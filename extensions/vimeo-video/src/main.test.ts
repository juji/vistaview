import { describe, it, expect } from 'vitest'
import { parseVimeoVideoId, getVimeoThumbnail } from './main'

describe('parseVimeoVideoId', () => {
  it('extracts from vimeo.com ID', () => {
    expect(parseVimeoVideoId('https://vimeo.com/123456789')).toBe('123456789')
  })
  it('extracts from player.vimeo.com', () => {
    expect(parseVimeoVideoId('https://player.vimeo.com/video/123456789')).toBe('123456789')
  })
  it('returns null for channel URL (not supported by regex)', () => {
    expect(parseVimeoVideoId('https://vimeo.com/channels/staffpicks/123456789')).toBeNull()
  })
  it('returns null for group URL (not supported by regex)', () => {
    expect(parseVimeoVideoId('https://vimeo.com/groups/motion/videos/123456789')).toBeNull()
  })
  it('returns null for invalid URL', () => {
    expect(parseVimeoVideoId('https://example.com')).toBeNull()
  })
  it('returns null for empty string', () => {
    expect(parseVimeoVideoId('')).toBeNull()
  })
})

describe('getVimeoThumbnail', () => {
  it('returns vumbnail.com URL', () => {
    expect(getVimeoThumbnail('https://vimeo.com/123456789')).toBe('https://vumbnail.com/123456789.jpg')
  })
  it('throws for invalid URL', () => {
    expect(() => getVimeoThumbnail('bad')).toThrow('Invalid Vimeo video URL')
  })
})

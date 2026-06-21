import { describe, it, expect } from 'vitest'
import { getDownloadFileName } from './main'

describe('getDownloadFileName', () => {
  it('uses alt with extension when available', () => {
    expect(getDownloadFileName('https://example.com/photo.jpg', 'My Photo')).toBe('My Photo.jpg')
  })

  it('returns last segment without alt', () => {
    expect(getDownloadFileName('https://example.com/photo.jpg')).toBe('photo.jpg')
  })

  it('strips query string', () => {
    expect(getDownloadFileName('https://example.com/photo.jpg?w=800', 'img')).toBe('img.jpg')
  })

  it('strips hash', () => {
    expect(getDownloadFileName('https://example.com/photo.jpg#section', 'img')).toBe('img.jpg')
  })

  it('handles URL without extension', () => {
    expect(getDownloadFileName('https://example.com/photo')).toBe('photo')
  })

  it('handles URL without path segments', () => {
    expect(getDownloadFileName('https://example.com')).toBe('example.com')
  })
})

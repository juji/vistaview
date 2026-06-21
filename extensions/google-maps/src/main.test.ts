import { describe, it, expect } from 'vitest'
import { parseGoogleMapsLocation } from './main'

describe('parseGoogleMapsLocation', () => {
  it('parses @lat,lng,zoom format', () => {
    const result = parseGoogleMapsLocation('https://www.google.com/maps/@40.7128,-74.006,15z')
    expect(result).toEqual({ lat: 40.7128, lng: -74.006, zoom: 15 })
  })

  it('parses q=lat,lng format', () => {
    const result = parseGoogleMapsLocation('https://www.google.com/maps?q=40.7128,-74.006')
    expect(result).toEqual({ lat: 40.7128, lng: -74.006, query: '40.7128,-74.006' })
  })

  it('returns null for empty string', () => {
    expect(parseGoogleMapsLocation('')).toBeNull()
  })
})

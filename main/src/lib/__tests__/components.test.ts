import { describe, it, expect, vi, beforeEach } from 'vitest'
import { vistaViewComponent } from '../components'
import type { VistaExtension } from '../types'

describe('vistaViewComponent', () => {
  it('renders root structure with default controls', () => {
    const html = vistaViewComponent({ controls: undefined, extensions: new Set() })
    expect(html.querySelector('#vvw-root')).toBeTruthy()
    expect(html.querySelector('.vvw-container')).toBeTruthy()
    expect(html.querySelector('.vvw-bg')).toBeTruthy()
    expect(html.querySelector('.vvw-image-container')).toBeTruthy()
    expect(html.querySelector('.vvw-prev')).toBeTruthy()
    expect(html.querySelector('.vvw-next')).toBeTruthy()
  })

  it('renders control slots', () => {
    const controls = {
      topLeft: ['zoomIn'],
      topRight: ['close', 'zoomOut'],
      bottomLeft: ['indexDisplay', 'description'],
    }
    const html = vistaViewComponent({ controls, extensions: new Set() })
    expect(html.querySelector('.vvw-zoom-in')).toBeTruthy()
    expect(html.querySelector('.vvw-zoom-out')).toBeTruthy()
    expect(html.querySelector('.vvw-close')).toBeTruthy()
    expect(html.querySelector('.vvw-index')).toBeTruthy()
    expect(html.querySelector('.vvw-desc')).toBeTruthy()
  })

  it('renders extension controls', () => {
    const ext: VistaExtension = {
      name: 'download',
      description: 'Download image',
      control: () => {
        const btn = document.createElement('button')
        btn.textContent = 'Download'
        return btn
      },
    }
    const html = vistaViewComponent({
      controls: { topRight: ['download'] },
      extensions: new Set([ext]),
    })
    const ctrl = html.querySelector('[data-vvw-control="download"]')
    expect(ctrl).toBeTruthy()
    expect(ctrl!.querySelector('button')?.textContent).toBe('Download')
  })

  it('warns on unknown control name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vistaViewComponent({
      controls: { topLeft: ['nonexistent'] },
      extensions: new Set(),
    })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown control'))
    warn.mockRestore()
  })

  it('does not render container for extension without control function', () => {
    const ext: VistaExtension = { name: 'nocontrol' }
    const html = vistaViewComponent({
      controls: { topLeft: ['nocontrol'] },
      extensions: new Set([ext]),
    })
    expect(html.querySelector('[data-vvw-control="nocontrol"]')).toBeNull()
  })

  it('creates trusted types policy on first call', async () => {
    // Reset module state so cachedPolicy is null
    vi.resetModules()
    const mod = await import('../components')
    const createPolicy = vi.fn((_name: string, rules: any) => rules)
    ;(window as any).trustedTypes = { createPolicy }

    mod.vistaViewComponent({ controls: undefined, extensions: new Set() })

    expect(createPolicy).toHaveBeenCalled()
  })
})

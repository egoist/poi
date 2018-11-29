import './assets/style.css'
import style from './assets/style.module.css'

describe('css inclusion', () => {
  it('supports css', () => {
    const div = document.createElement('div')
    div.className = 'feature-css-inclusion'
    document.body.appendChild(div)
    expect(getComputedStyle(div).fontSize).toBe('66px')
  })

  it('supports css modules extension', () => {
    expect(style).toEqual({
      fooBar: 'features-assets-style-module__fooBar--2uH2m'
    })
  })
})

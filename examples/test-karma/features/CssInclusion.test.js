import './assets/style.css'
import style from './assets/style.module.css'
import './assets/style.scss'

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

  it('supports sass', () => {
    const div = document.createElement('div')
    div.className = 'sass'
    div.innerHTML = `<div class="sass-nested"></div>`
    document.body.appendChild(div)
    expect(getComputedStyle(div.querySelector('.sass-nested')).fontSize, '33px')
  })
})

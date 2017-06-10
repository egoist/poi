import './global.css'
import style from './index.module.css'

const h1 = document.createElement('h1')
h1.textContent = 'Hello, CSS modules!'
h1.className = style.title

document.body.appendChild(h1)

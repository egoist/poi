function render(selector: string) {
  const el = document.createElement('h1')
  el.textContent = 'hello world'
  document.querySelector(selector).appendChild(el)
}

render('#app')

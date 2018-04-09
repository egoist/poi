module.exports = class Hooks {
  constructor() {
    this.hooks = new Map()
  }

  add(name, fn) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set())
    }
    const hook = this.hooks.get(name)
    if (!hook) {
      throw new Error(`No hook named "${name}" was found in Poi`)
    }
    hook.add(fn)
    return this
  }

  invoke(name, ...args) {
    this.hooks.get(name).forEach(fn => {
      fn(...args)
    })
    return this
  }
}

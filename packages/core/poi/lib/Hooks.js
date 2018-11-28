module.exports = class Hooks {
  constructor() {
    this.hooks = new Map()
  }

  add(name, fn) {
    const hooks = this.get(name)
    hooks.add(fn)
    this.hooks.set(name, hooks)
  }

  get(name) {
    return this.hooks.get(name) || new Set()
  }

  invoke(name, ...args) {
    for (const hook of this.get(name)) {
      hook(...args)
    }
  }

  async invokePromise(name, ...args) {
    for (const hook of this.get(name)) {
      await hook(...args)
    }
  }
}

module.exports = class Hooks {
  constructor() {
    this.hooks = new Map()
  }

  add(name, fn) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set())
    }
    const hook = this.hooks.get(name)
    hook.add(fn)
    return this
  }

  invoke(name, ...args) {
    if (this.hooks.has(name)) {
      this.hooks.get(name).forEach(fn => {
        fn(...args)
      })
    }
    return this
  }

  async invokePromise(name, ...args) {
    if (this.hooks.has(name)) {
      for (const fn of this.hooks.get(name)) {
        // eslint-disable-next-line no-await-in-loop
        await fn(...args)
      }
    }
    return this
  }
}

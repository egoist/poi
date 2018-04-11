export const routerReady = router =>
  new Promise((resolve, reject) => {
    router.onReady(resolve, reject)
  })

export const prepareComponents = (components, context) =>
  Promise.all(components.map(({ prepare }) => prepare && prepare(context)))

import './main'
import app from '@project-entry'
import { routerReady, prepareComponents } from './utils'

export default async context => {
  const { url } = context
  app.$router.push(url)

  await routerReady(app.$router)

  const matchedComponents = app.$router.getMatchedComponents()
  if (matchedComponents.length === 0) {
    throw new Error({
      code: 'ROUTE_COMPONENT_NOT_FOUND',
      message: `Cannot find corresponding route component for ${url}`
    })
  }

  await prepareComponents(matchedComponents, {
    url,
    store: app.$store,
    route: app.$router.currentRoute
  })

  if (app.$store) {
    context.state = app.$store.state
  }

  context.renderMeta = () => {
    if (!app.$meta) {
      return ''
    }

    const { title, link, style, script, noscript, meta } = app.$meta().inject()

    return `${meta.text()}
    ${title.text()}
    ${link.text()}
    ${style.text()}
    ${script.text()}
    ${noscript.text()}`
  }

  return app
}

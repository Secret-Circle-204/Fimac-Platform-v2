const routes = {
  // marketing pages
  home: "/",
  // SEO-friendly property route: ID is the source of truth, slug is for SEO only
  "property.show": "/home/property/:id/:slug",
} as const

export type Route = keyof typeof routes

function parseParams<P>(route: Route, params?: P): string {
  const path = routes[route]
  if (!path) {
    throw new Error(`Route ${route} not found`)
  }

  if (!params) {
    return path
  }

  // string replace
  const parsedRoute = path.replace(/\/:([^/]+)/g, (match, key) => {
    return `/${params[key as keyof P]}`
  })
  return parsedRoute
}

function routeFn<P>(route: Route, params?: Partial<P>): string {
  return parseParams(route, params)
}

// optimize with memoization for repeated calls to the same route
const route = routeFn

export default route

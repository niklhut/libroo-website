export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) {
    if ('itsmebob' in to.query) {
      window.localStorage.setItem('umami.disabled', '1')
      window.console.info('Hello, Bob.')

      const { itsmebob, ...otherParams } = to.query

      return navigateTo({
        path: to.path,
        query: otherParams,
        hash: to.hash
      }, { replace: true })
    }
  }
})

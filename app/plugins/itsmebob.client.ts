export default defineNuxtPlugin({
  hooks: {
    'app:beforeMount': async function () {
      const query = useRoute().query
      if ('itsmebob' in query) {
        const { itsmebob, ...otherParams } = query
        navigateTo({ query: otherParams })
        window.localStorage.setItem('umami.disabled', '1')
        window.console.info(`Hello, Bob.`)
      }
    }
  }
})

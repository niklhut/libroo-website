export default defineNuxtPlugin(() => {
  const route = useRoute()
  if ('itsmebob' in route.query) {
    window.localStorage.setItem('umami.disabled', '1')
    window.console.info('Hello, Bob.')
  }
})

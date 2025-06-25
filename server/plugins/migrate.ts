export default defineNitroPlugin(async () => {
  // TODO: remove
  const runtimeConfig = useRuntimeConfig()
  console.log(runtimeConfig)

  await runTask('db:migrate')
})

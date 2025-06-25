<script lang="ts" setup>
import { WaitlistSchema } from '#shared/schema/waitlist'

const isOpen = ref(false)

const toast = useToast()

const { title, description } = defineProps<{
  title: string
  description: string
}>()

const state = reactive({
  email: '',
  token: ''
})

const onSubmit = async () => {
  try {
    const { data } = await useFetch('/api/waitlist', {
      method: 'POST',
      body: state
    })

    if (data.value?.success) {
      toast.add({
        title: 'Success',
        description: 'You have been added to the waitlist!',
        color: 'success'
      })

      state.email = ''
      state.token = ''

      isOpen.value = false
    }
  } catch (error) {
    console.log(error)
    toast.add({
      title: 'Error',
      description: 'Something went wrong',
      color: 'error'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :description="description"
  >
    <slot />

    <template #body>
      <UForm
        :schema="WaitlistSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          name="email"
          label="Email"
        >
          <UInput
            v-model="state.email"
            class="w-full"
          />
        </UFormField>

        <NuxtTurnstile v-model="state.token" />

        <UButton
          type="submit"
          color="primary"
          label="Notify Me"
        />
      </UForm>
    </template>
  </UModal>
</template>

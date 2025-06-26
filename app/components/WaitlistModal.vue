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
    const data = await $fetch('/api/waitlist', {
      method: 'POST',
      body: state
    })

    if (data?.success) {
      umTrackEvent('join_waitlist', {
        email: state.email,
        success: true
      })
      toast.add({
        title: 'Success',
        description: 'You have been added to the waitlist!',
        color: 'success'
      })
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 403) {
      umTrackEvent('join_waitlist', {
        email: state.email,
        success: false,
        reason: 'captcha_failed'
      })
      toast.add({
        title: 'Captcha failed',
        description: 'Please try again',
        color: 'error'
      })
    } else {
      umTrackEvent('join_waitlist', {
        email: state.email,
        success: false,
        reason: 'unknown'
      })
      toast.add({
        title: 'Error',
        description: 'Something went wrong',
        color: 'error'
      })
    }
  }

  state.email = ''
  state.token = ''

  isOpen.value = false
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

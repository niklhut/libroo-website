<script lang="ts" setup>
import { WaitlistSchema } from '#shared/schema/waitlist'

const isOpen = ref(false)

const toast = useToast()
const { proxy } = useScriptUmamiAnalytics()

const { title, description } = defineProps<{
  title: string
  description: string
}>()

const emit = defineEmits<{ close: [] }>()

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
      proxy.track('join_waitlist', {
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
      proxy.track('join_waitlist', {
        email: state.email,
        success: false,
        reason: 'api_denied_captcha'
      })
      toast.add({
        title: 'Captcha failed',
        description: 'Please try again',
        color: 'error'
      })
    } else {
      proxy.track('join_waitlist', {
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

  emit('close')
}

const nuxtTurnstileOptions = {
  'error-callback': () => {
    proxy.track('join_waitlist', {
      email: state.email,
      success: false,
      reason: 'turnstile_error'
    })
  },
  'expired-callback': () => {
    proxy.track('join_waitlist', {
      email: state.email,
      success: false,
      reason: 'turnstile_expired'
    })
  },
  'timeout-callback': () => {
    proxy.track('join_waitlist', {
      email: state.email,
      success: false,
      reason: 'turnstile_timeout'
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

        <NuxtTurnstile
          v-model="state.token"
          :options="nuxtTurnstileOptions"
        />

        <UButton
          type="submit"
          color="primary"
          label="Notify Me"
        />
      </UForm>
    </template>
  </UModal>
</template>

import * as v from 'valibot'

export const WaitlistSchema = v.object({
  email: v.pipe(v.string('Email is required'), v.email('Invalid email')),
  token: v.pipe(v.string('Token is required'), v.minLength(1))
})

export type WaitlistInput = v.InferInput<typeof WaitlistSchema>

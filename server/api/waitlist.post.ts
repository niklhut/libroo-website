import { parse } from 'valibot'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, body => parse(WaitlistSchema, body))

  const validationResponse = await verifyTurnstileToken(body.token)

  if (!validationResponse.success) {
    return sendError(event, createError({ statusCode: 403, message: 'Turnstile verification failed' }))
  }

  const existing = await db.select().from(waitlist).where(eq(waitlist.email, body.email)).get()

  if (existing) {
    return sendError(event, createError({ statusCode: 409, message: 'Email already in waitlist' }))
  }

  try {
    await db.insert(waitlist).values({ email: body.email })
    return { success: true }
  } catch {
    return sendError(event, createError({ statusCode: 500, message: 'Could not add to waitlist' }))
  }
})

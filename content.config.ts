import { defineCollection, z } from '@nuxt/content'

const createEnum = (options: [string, ...string[]]) => z.enum(options)

const createBaseSchema = () => z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty()
})

const createLinkSchema = () => z.object({
  label: z.string().nonempty(),
  to: z.string().nonempty().optional(),
  appPath: z.string().nonempty().optional(),
  icon: z.string().optional().editor({ input: 'icon' }),
  size: createEnum(['xs', 'sm', 'md', 'lg', 'xl']).optional(),
  trailing: z.boolean().optional(),
  target: createEnum(['_blank', '_self']).optional(),
  color: createEnum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info']).optional(),
  variant: createEnum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']).optional()
}).refine(link => Boolean(link.to || link.appPath), {
  message: 'Either "to" or "appPath" must be provided'
})

const createFeatureSchema = () => createBaseSchema().extend({
  icon: z.string().editor({ input: 'icon' }),
  ui: z.object({
    leading: z.string().optional()
  }).editor({ hidden: true })
})

export const collections = {
  content: defineCollection({
    source: 'index.yml',
    type: 'page',
    schema: z.object({
      hero: z.object({
        badge: z.object({
          label: z.string().nonempty(),
          icon: z.string().optional().editor({ input: 'icon' })
        }).optional(),
        links: z.array(createLinkSchema())
      }),
      section: createBaseSchema().extend({
        headline: z.string().optional(),
        images: z.object({
          mobile: z.string().optional(),
          desktop: z.string().optional()
        }),
        features: z.array(
          createBaseSchema().extend({
            icon: z.string().editor({ input: 'icon' }).optional(),
            class: z.string().optional()
          })
        )
      }),
      features: createBaseSchema().extend({
        features: z.array(createFeatureSchema())
      }),
      cta: createBaseSchema().extend({
        note: z.string().optional(),
        links: z.array(createLinkSchema())
      })
    })
  })
}

import { z } from 'zod'

export const cardTranslationSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().min(1),
  example: z.string().min(1),
  examCue: z.string().min(1).optional(),
})

export const cardTranslationListSchema = z.array(cardTranslationSchema)
export type CardTranslation = z.infer<typeof cardTranslationSchema>


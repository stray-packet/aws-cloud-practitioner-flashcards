import { z } from 'zod'

export const domainSchema = z.enum([
  'Cloud Concepts',
  'Security and Compliance',
  'Cloud Technology and Services',
  'Billing, Pricing, and Support',
])

export const cardTypeSchema = z.enum([
  'recall',
  'scenario',
  'comparison',
  'cloze',
  'single-choice',
  'multiple-response',
])

const optionSchema = z.object({ id: z.string().min(1), text: z.string().min(1) })

export const flashcardSchema = z.object({
  id: z.string().regex(/^clf-c02-\d{4}-\d{2}-\d{2}-\d{3}$/),
  certification: z.literal('CLF-C02'),
  studyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  domain: domainSchema,
  topics: z.array(z.string().min(1)).min(1),
  services: z.array(z.string().min(1)),
  type: cardTypeSchema,
  prompt: z.string().min(8),
  answer: z.string().min(1),
  explanation: z.string().min(8),
  examCue: z.string().optional(),
  options: z.array(optionSchema).min(2).optional(),
  correctOptions: z.array(z.string().min(1)).optional(),
  sourceRef: z.string().min(1),
  difficulty: z.number().int().min(1).max(5),
  status: z.enum(['draft', 'approved']),
  version: z.number().int().positive(),
}).superRefine((card, context) => {
  const isExam = card.type === 'single-choice' || card.type === 'multiple-response'
  if (isExam && (!card.options || !card.correctOptions?.length)) {
    context.addIssue({ code: 'custom', message: 'Exam cards require options and correctOptions.' })
  }
  if (card.options && card.correctOptions) {
    const optionIds = new Set(card.options.map((option) => option.id))
    if (card.correctOptions.some((id) => !optionIds.has(id))) {
      context.addIssue({ code: 'custom', message: 'correctOptions must reference an option id.' })
    }
  }
})

export const flashcardListSchema = z.array(flashcardSchema)
export type Flashcard = z.infer<typeof flashcardSchema>
export type CardDomain = z.infer<typeof domainSchema>
export type CardType = z.infer<typeof cardTypeSchema>

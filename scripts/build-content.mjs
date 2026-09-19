import fs from 'node:fs/promises'
import path from 'node:path'
import { flashcardSchema } from './card-schema.mjs'

const root = process.cwd()
const approvedDir = path.join(root, 'flashcards', 'approved')
const outputFile = path.join(root, 'src', 'data', 'generated-cards.json')
const translationsFile = path.join(root, 'flashcards', 'translations', 'es.json')
const translationsOutputFile = path.join(root, 'src', 'data', 'generated-translations-es.json')
const files = (await fs.readdir(approvedDir)).filter((file) => file.endsWith('.json')).sort()
const cards = []

for (const file of files) {
  const parsed = JSON.parse(await fs.readFile(path.join(approvedDir, file), 'utf8'))
  if (!Array.isArray(parsed)) throw new Error(`${file} must contain a JSON array.`)
  cards.push(...parsed.map((card) => flashcardSchema.parse(card)))
}

const duplicateIds = cards.filter((card, index) => cards.findIndex((candidate) => candidate.id === card.id) !== index)
if (duplicateIds.length) throw new Error(`Duplicate card ids: ${duplicateIds.map((card) => card.id).join(', ')}`)
const placeholderExamples = cards.filter((card) => /^A question asks for /i.test(card.example))
if (placeholderExamples.length) throw new Error(`Replace placeholder examples with real scenarios: ${placeholderExamples.map((card) => card.id).join(', ')}`)

cards.sort((a, b) => a.id.localeCompare(b.id))
await fs.writeFile(outputFile, `${JSON.stringify(cards, null, 2)}\n`, 'utf8')

const translations = JSON.parse(await fs.readFile(translationsFile, 'utf8'))
if (!Array.isArray(translations)) throw new Error('Spanish translations must contain a JSON array.')
const cardIds = new Set(cards.map((card) => card.id))
const cardsById = new Map(cards.map((card) => [card.id, card]))
const translationIds = new Set()
for (const translation of translations) {
  if (!translation || typeof translation !== 'object') throw new Error('Each Spanish translation must be an object.')
  if (!cardIds.has(translation.id)) throw new Error(`Translation references unknown card ${translation.id}.`)
  if (translationIds.has(translation.id)) throw new Error(`Duplicate Spanish translation ${translation.id}.`)
  translationIds.add(translation.id)
  for (const field of ['prompt', 'answer', 'explanation', 'example']) {
    if (typeof translation[field] !== 'string' || !translation[field].trim()) throw new Error(`${translation.id} is missing Spanish ${field}.`)
  }
  if (translation.examCue !== undefined && (typeof translation.examCue !== 'string' || !translation.examCue.trim())) throw new Error(`${translation.id} has an invalid Spanish examCue.`)
  if (cardsById.get(translation.id).examCue && !translation.examCue) throw new Error(`${translation.id} is missing its Spanish examCue.`)
}
const missingTranslations = cards.filter((card) => !translationIds.has(card.id))
if (missingTranslations.length) throw new Error(`Missing Spanish translations: ${missingTranslations.map((card) => card.id).join(', ')}`)

translations.sort((a, b) => a.id.localeCompare(b.id))
await fs.writeFile(translationsOutputFile, `${JSON.stringify(translations, null, 2)}\n`, 'utf8')
console.log(`Generated ${cards.length} approved cards and ${translations.length} Spanish translations.`)

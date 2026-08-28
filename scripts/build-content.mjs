import fs from 'node:fs/promises'
import path from 'node:path'
import { flashcardSchema } from './card-schema.mjs'

const root = process.cwd()
const approvedDir = path.join(root, 'flashcards', 'approved')
const outputFile = path.join(root, 'src', 'data', 'generated-cards.json')
const files = (await fs.readdir(approvedDir)).filter((file) => file.endsWith('.json')).sort()
const cards = []

for (const file of files) {
  const parsed = JSON.parse(await fs.readFile(path.join(approvedDir, file), 'utf8'))
  if (!Array.isArray(parsed)) throw new Error(`${file} must contain a JSON array.`)
  cards.push(...parsed.map((card) => flashcardSchema.parse(card)))
}

const duplicateIds = cards.filter((card, index) => cards.findIndex((candidate) => candidate.id === card.id) !== index)
if (duplicateIds.length) throw new Error(`Duplicate card ids: ${duplicateIds.map((card) => card.id).join(', ')}`)

cards.sort((a, b) => a.id.localeCompare(b.id))
await fs.writeFile(outputFile, `${JSON.stringify(cards, null, 2)}\n`, 'utf8')
console.log(`Generated ${cards.length} approved cards.`)

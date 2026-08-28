import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const cards = JSON.parse(await fs.readFile(path.join(root, 'src', 'data', 'generated-cards.json'), 'utf8'))
const escapeField = (value) => `"${String(value).replaceAll('"', '""').replaceAll('\n', '<br>')}"`
const rows = ['#separator:Tab', '#html:true', '#columns:ID\tFront\tBack\tExplanation\tTags', '#tags column:5']

for (const card of cards) {
  const tags = [card.certification, card.domain, `day::${card.studyDate}`, `type::${card.type}`, ...card.topics.map((topic) => `topic::${topic.replaceAll(' ', '_')}`)].join(' ')
  rows.push([card.id, card.prompt, card.answer, card.explanation, tags].map(escapeField).join('\t'))
}

const output = path.join(root, 'exports', 'anki', 'aws-cloud-practitioner.tsv')
await fs.writeFile(output, `\uFEFF${rows.join('\n')}\n`, 'utf8')
console.log(`Exported ${cards.length} cards to ${output}`)

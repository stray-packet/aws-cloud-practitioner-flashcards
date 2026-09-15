import fs from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const approvedDir = path.join(root, 'flashcards', 'approved')
const outputDir = path.join(root, 'flashcards', 'translations')
const outputFile = path.join(outputDir, 'es.json')
const files = (await fs.readdir(approvedDir)).filter((file) => file.endsWith('.json')).sort()
const cards = (await Promise.all(files.map(async (file) => JSON.parse(await fs.readFile(path.join(approvedDir, file), 'utf8'))))).flat()
const delimiter = '\n<<<>>>\n'
const protectedTerms = [
  ...new Set(cards.flatMap((card) => card.services)),
  'Amazon SQS', 'Amazon SNS', 'Amazon EC2', 'Amazon RDS', 'Amazon S3', 'Amazon EBS', 'Amazon EFS',
  'AWS Management Console', 'AWS CLI', 'AWS Cloud Adoption Framework', 'AWS Well-Architected Framework',
  'AWS Well-Architected Tool', 'AWS Architecture Center', 'AWS Trust & Safety', 'AWS Support',
  'Compute Savings Plans', 'EC2 Instance Savings Plans', 'SageMaker AI Savings Plans', 'Database Savings Plans', 'Savings Plans',
  'Regional Reserved Instance', 'Zonal Reserved Instance', 'Standard Reserved Instance', 'Convertible Reserved Instance',
  'Regional RI', 'Zonal RI', 'Standard RI', 'Convertible RI', 'Reserved Instances', 'Reserved Instance',
  'On-Demand Capacity Reservation', 'On-Demand Capacity Reservations', 'On-Demand Instances', 'On-Demand Instance', 'On-Demand',
  'Spot Instances', 'Spot Instance', 'Dedicated Instances', 'Dedicated Instance', 'Dedicated Hosts', 'Dedicated Host',
  'Account Factory', 'Landing Zone', 'Control Tower', 'CloudFormation', 'CloudFront', 'CloudWatch', 'CloudTrail',
  'GuardDuty', 'PrivateLink', 'Global Accelerator', 'Transfer Acceleration', 'Local Zones', 'Local Zone',
  'Wavelength Zones', 'Wavelength Zone', 'Availability Zones', 'Availability Zone',
  'Security Groups', 'Security Group', 'Network ACLs', 'Network ACL', 'NACLs', 'NACL',
  'Internet Gateway', 'NAT Gateway', 'Gateway Endpoint', 'Interface Endpoint', 'VPC Endpoint',
  'Elastic Load Balancing', 'Auto Scaling', 'Elastic Fabric Adapter', 'Multi-Attach',
  'AWS Fargate', 'Amazon ECS', 'Amazon EKS', 'Amazon ECR', 'Kubernetes Pod', 'Pod',
  'AWS Glue Data Catalog', 'Data Catalog', 'AWS Glue crawler', 'AWS Glue worker',
  'Recovery Point Objective', 'Recovery Time Objective', 'RPO', 'RTO',
  'Infrastructure as Code', 'Infrastructure as a Service', 'Software as a Service', 'Platform as a Service',
  'IAM Identity Center', 'IAM Access Key', 'IAM role', 'IAM user', 'root user',
  'Trusted Advisor', 'Well-Architected Tool', 'X-Ray', 'Outposts', 'WorkSpaces', 'Athena', 'Lightsail',
  'Compute Optimizer', 'RIs', 'RI',
].filter(Boolean).sort((a, b) => b.length - a.length)

const translationOverrides = new Map([
  ['clf-c02-2026-08-28-027', { answer: 'No. También necesita una dirección IP pública adecuada y reglas de seguridad que permitan el tráfico.' }],
  ['clf-c02-2026-08-28-078', { answer: 'No. Son un descuento de facturación aplicado al uso On-Demand que coincida; algunas RI zonales también reservan capacidad.' }],
  ['clf-c02-2026-09-15-011', { answer: 'Restringe las circunstancias en las que se aplica una declaración de política.' }],
])

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function protectTerms(value) {
  const replacements = []
  let protectedValue = value
  for (const term of protectedTerms) {
    const expression = new RegExp(escapeRegExp(term), 'g')
    if (!expression.test(protectedValue)) continue
    const placeholder = `__AWS_TERM_${replacements.length}__`
    protectedValue = protectedValue.replace(expression, placeholder)
    replacements.push([placeholder, term])
  }
  return { protectedValue, replacements }
}

function restoreTerms(value, replacements) {
  return replacements.reduce((current, [placeholder, term]) => current.replaceAll(placeholder, term), value)
}

function normalizeSpanish(value) {
  return value
    .replaceAll('Instancias informáticas virtuales', 'Instancias de cómputo virtual')
    .replaceAll('instancias informáticas virtuales', 'instancias de cómputo virtual')
    .replaceAll('los sondeen', 'los consulten')
    .replace(/\bdepósitos\b/gi, 'buckets')
    .replace(/\bdepósito\b/gi, 'bucket')
    .replace(/\bpuntos finales\b/gi, 'endpoints')
    .replace(/\bpunto final\b/gi, 'endpoint')
    .replace(/puertas de enlace de Internet/gi, 'internet gateways')
    .replace(/puerta de enlace de Internet/gi, 'internet gateway')
    .replace(/puertas de enlace NAT/gi, 'NAT gateways')
    .replace(/puerta de enlace NAT/gi, 'NAT gateway')
    .replace(/Instancias puntuales EC2/g, 'EC2 Spot Instances')
    .replace(/Instancias puntuales/g, 'Spot Instances')
    .replace(/Planes de Ahorro/g, 'Savings Plans')
    .replace(/Presupuestos de AWS/g, 'AWS Budgets')
    .replace(/Explorador de costos de AWS/g, 'AWS Cost Explorer')
    .replace(/Calculadora de precios de AWS/g, 'AWS Pricing Calculator')
    .replace(/Aceleración de transferencia S3/g, 'S3 Transfer Acceleration')
}

async function translateCard(card) {
  const fields = [card.prompt, card.answer, card.explanation, card.example ?? '', card.examCue ?? '']
  const { protectedValue, replacements } = protectTerms(fields.join(delimiter))
  const query = new URLSearchParams({ client: 'gtx', sl: 'en', tl: 'es', dt: 't', q: protectedValue })
  let lastError
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`)
      if (!response.ok) throw new Error(`Translation request failed with ${response.status}`)
      const payload = await response.json()
      const translated = restoreTerms(payload[0].map((part) => part[0]).join(''), replacements)
      const values = translated.split(/\n?<<<>>>\n?/)
      if (values.length !== fields.length) throw new Error(`Expected ${fields.length} translated fields, received ${values.length}`)
      const translation = {
        id: card.id,
        prompt: normalizeSpanish(values[0].trim()),
        answer: normalizeSpanish(values[1].trim()),
        explanation: normalizeSpanish(values[2].trim()),
        example: normalizeSpanish(values[3].trim()),
        ...(card.examCue ? { examCue: normalizeSpanish(values[4].trim()) } : {}),
      }
      return { ...translation, ...translationOverrides.get(card.id) }
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, attempt * 400))
    }
  }
  throw new Error(`Could not translate ${card.id}`, { cause: lastError })
}

const translations = new Array(cards.length)
let nextIndex = 0
let completed = 0

async function worker() {
  while (nextIndex < cards.length) {
    const index = nextIndex
    nextIndex += 1
    translations[index] = await translateCard(cards[index])
    completed += 1
    if (completed % 25 === 0 || completed === cards.length) console.log(`Translated ${completed}/${cards.length}`)
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()))
await fs.mkdir(outputDir, { recursive: true })
await fs.writeFile(outputFile, `${JSON.stringify(translations, null, 2)}\n`, 'utf8')
console.log(`Wrote ${translations.length} Spanish translations to ${outputFile}`)

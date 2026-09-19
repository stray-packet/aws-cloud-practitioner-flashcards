import { describe, expect, it } from 'vitest'
import catalog from './service-catalog.json'

describe('visual AWS service catalog', () => {
  it('has unique, complete entries backed by local official icons', () => {
    expect(new Set(catalog.map((service) => service.id)).size).toBe(catalog.length)
    expect(catalog.filter((service) => service.scope === 'official').length).toBeGreaterThanOrEqual(112)
    for (const service of catalog) {
      expect(service.name).toBeTruthy()
      expect(service.purpose).toBeTruthy()
      expect(service.hint).toBeTruthy()
      expect(service.examCue).toBeTruthy()
      expect(service.example).toBeTruthy()
      expect(service.example).not.toMatch(/^A question asks for /i)
      expect(service.groups.length).toBeGreaterThan(0)
      expect(service.icon).toMatch(/^Arch[_-].+_64\.svg$/)
    }
  })

  it('allows cross-cutting services to appear in more than one study category', () => {
    const iam = catalog.find((service) => service.id === 'aws-iam')
    expect(iam?.groups).toEqual(expect.arrayContaining(['Identity & Access', 'Security & Threat Protection']))
  })
})

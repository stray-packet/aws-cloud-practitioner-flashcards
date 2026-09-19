import { describe, expect, it } from 'vitest'
import { parseProgressJson } from './storage'

describe('local progress backups', () => {
  it('restores a valid exported store', () => {
    const store = parseProgressJson(JSON.stringify({ cards: {}, reviewLogs: [], examAttempts: [], flaggedServiceIds: ['amazon-s3', 'aws-iam'], settings: { retention: 0.92, newCardsPerDay: 15, theme: 'dark' } }))
    expect(store.settings).toEqual({ retention: 0.92, newCardsPerDay: 15, theme: 'dark' })
    expect(store.flaggedServiceIds).toEqual(['amazon-s3', 'aws-iam'])
  })

  it('keeps older backups usable while adding an empty service flag list', () => {
    const store = parseProgressJson(JSON.stringify({ cards: {}, reviewLogs: [], examAttempts: [], settings: { retention: 0.9, newCardsPerDay: 10, theme: 'system' } }))
    expect(store.flaggedServiceIds).toEqual([])
  })

  it('rejects an unrelated JSON file', () => {
    expect(() => parseProgressJson('{"hello":"world"}')).toThrow(/valid AWS Study/)
  })
})

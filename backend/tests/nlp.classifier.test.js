import { describe, expect, it } from 'vitest'

import {
  applyClassificationOverrides,
  classifyComplaintText,
  normalizeNlpCategory,
} from '../src/modules/complaint/nlp.classifier.js'

describe('complaint NLP classifier fallback', () => {
  it('classifies fire as an urgent electrical complaint', () => {
    expect(classifyComplaintText('fire')).toMatchObject({
      category: 'Electrical',
      priority: 'HIGH',
    })
  })

  it('classifies generic electricity complaints without forcing high priority', () => {
    expect(classifyComplaintText('Electricity')).toMatchObject({
      category: 'Electrical',
      priority: 'MEDIUM',
    })
  })

  it('classifies water supply complaints as plumbing', () => {
    expect(classifyComplaintText('water not coming')).toMatchObject({
      category: 'Plumbing',
      priority: 'MEDIUM',
    })
  })

  it('marks burst plumbing issues as high priority', () => {
    expect(classifyComplaintText('pipe burst in bathroom')).toMatchObject({
      category: 'Plumbing',
      priority: 'HIGH',
    })
  })

  it('maps old NLP model category names to frontend categories', () => {
    expect(normalizeNlpCategory('Electricity')).toBe('Electrical')
    expect(normalizeNlpCategory('Water')).toBe('Plumbing')
    expect(normalizeNlpCategory('Network')).toBe('IT')
    expect(normalizeNlpCategory('Sanitation')).toBe('Cleaning')
    expect(normalizeNlpCategory('Furniture')).toBe('Maintenance')
  })

  it('overrides weak or wrong NLP responses for obvious complaint text', () => {
    expect(
      applyClassificationOverrides('fire in electrical room', {
        category: 'Other',
        priority: 'MEDIUM',
        category_confidence: 0.2,
      })
    ).toMatchObject({
      category: 'Electrical',
      priority: 'HIGH',
      source: 'rules',
    })
  })
})

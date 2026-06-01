const VALID_CATEGORIES = new Set([
  'Electrical',
  'Plumbing',
  'IT',
  'Cleaning',
  'Maintenance',
  'Administration',
  'Other',
])

const CATEGORY_ALIASES = {
  Electricity: 'Electrical',
  Electrical: 'Electrical',
  Electric: 'Electrical',
  Water: 'Plumbing',
  Plumbing: 'Plumbing',
  Network: 'IT',
  IT: 'IT',
  Technology: 'IT',
  Computer: 'IT',
  Sanitation: 'Cleaning',
  Cleaning: 'Cleaning',
  Furniture: 'Maintenance',
  Maintenance: 'Maintenance',
  Admin: 'Administration',
  Administration: 'Administration',
  Other: 'Other',
}

const PRIORITY_ALIASES = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const keywordPattern = keyword =>
  new RegExp(`(^|[^a-z0-9])${escapeRegex(keyword).replace(/\s+/g, '\\s+')}([^a-z0-9]|$)`, 'i')

const compileKeywords = keywords => keywords.map(keywordPattern)

const matchesAny = (text, patterns) => patterns.some(pattern => pattern.test(text))

const CATEGORY_RULES = [
  {
    category: 'Electrical',
    patterns: compileKeywords([
      'fire',
      'smoke',
      'burning',
      'electricity',
      'electrical',
      'power',
      'power cut',
      'power outage',
      'no electricity',
      'short circuit',
      'spark',
      'sparking',
      'shock',
      'electric shock',
      'electrocution',
      'exposed wire',
      'wire',
      'wiring',
      'switch',
      'socket',
      'outlet',
      'breaker',
      'voltage',
      'light',
      'fan',
      'ac',
    ]),
  },
  {
    category: 'Plumbing',
    patterns: compileKeywords([
      'water',
      'no water',
      'water not coming',
      'drinking water',
      'water cooler',
      'tap',
      'pipe',
      'leak',
      'leaking',
      'burst pipe',
      'flood',
      'flooding',
      'overflow',
      'drain',
      'toilet',
      'bathroom',
      'washroom',
      'flush',
      'sink',
      'sewer',
      'sewage',
    ]),
  },
  {
    category: 'IT',
    patterns: compileKeywords([
      'wifi',
      'wi-fi',
      'internet',
      'network',
      'server',
      'login',
      'portal',
      'website',
      'app',
      'software',
      'computer',
      'pc',
      'lab pc',
      'printer',
      'projector',
      'rfid',
      'system error',
      'password',
    ]),
  },
  {
    category: 'Cleaning',
    patterns: compileKeywords([
      'cleaning',
      'dirty',
      'garbage',
      'trash',
      'waste',
      'dustbin',
      'smell',
      'odor',
      'odour',
      'hygiene',
      'sanitation',
      'mosquito',
      'pest',
      'graffiti',
    ]),
  },
  {
    category: 'Maintenance',
    patterns: compileKeywords([
      'broken',
      'repair',
      'damaged',
      'furniture',
      'chair',
      'bench',
      'desk',
      'table',
      'door',
      'window',
      'lock',
      'ceiling',
      'roof',
      'wall',
      'floor',
      'lift',
      'elevator',
      'classroom',
      'infrastructure',
    ]),
  },
  {
    category: 'Administration',
    patterns: compileKeywords([
      'fee',
      'fees',
      'scholarship',
      'certificate',
      'exam',
      'timetable',
      'attendance',
      'id card',
      'canteen',
      'cafeteria',
      'food',
      'office',
      'document',
      'admission',
      'library',
    ]),
  },
]

const HIGH_PRIORITY_PATTERNS = [
  ...compileKeywords([
    'fire',
    'smoke',
    'burning',
    'short circuit',
    'electric shock',
    'electrocution',
    'exposed wire',
    'gas leak',
    'flood',
    'flooding',
    'burst',
    'burst pipe',
    'overflow',
    'sewage leak',
    'collapse',
    'collapsed',
    'injury',
    'injured',
    'accident',
    'emergency',
    'urgent',
    'danger',
    'dangerous',
    'hazard',
    'hazardous',
    'contaminated',
    'food poisoning',
  ]),
  /\b(no water|water not coming|no electricity|power outage|internet down|network down)\b.*\b(entire|whole|all|hostel|building|block|campus|exam|lab|server|urgent|emergency)\b/i,
  /\b(entire|whole|all|hostel|building|block|campus|exam|lab|server|urgent|emergency)\b.*\b(no water|water not coming|no electricity|power outage|internet down|network down)\b/i,
]

const LOW_PRIORITY_PATTERNS = compileKeywords([
  'suggestion',
  'suggest',
  'request',
  'recommend',
  'improvement',
  'minor',
  'small',
  'convenience',
  'would be nice',
  'if possible',
])

const clampConfidence = value => {
  const confidence = Number(value)

  if (!Number.isFinite(confidence)) {
    return 0
  }

  return Math.max(0, Math.min(1, confidence))
}

export const normalizeNlpCategory = category => {
  const normalized = CATEGORY_ALIASES[String(category ?? '').trim()]

  if (normalized && VALID_CATEGORIES.has(normalized)) {
    return normalized
  }

  return 'Other'
}

export const normalizeNlpPriority = priority =>
  PRIORITY_ALIASES[String(priority ?? '').trim().toLowerCase()] ?? 'MEDIUM'

export const classifyComplaintText = text => {
  const complaintText = String(text ?? '').trim()

  if (!complaintText) {
    return {
      category: 'Other',
      priority: 'MEDIUM',
      confidence: 0,
      source: 'rules',
    }
  }

  const matchedRule = CATEGORY_RULES.find(rule => matchesAny(complaintText, rule.patterns))
  const hasHighSignal = matchesAny(complaintText, HIGH_PRIORITY_PATTERNS)
  const hasLowSignal = matchesAny(complaintText, LOW_PRIORITY_PATTERNS)

  return {
    category: matchedRule?.category ?? 'Other',
    priority: hasHighSignal ? 'HIGH' : hasLowSignal ? 'LOW' : 'MEDIUM',
    confidence: matchedRule ? 0.95 : hasHighSignal || hasLowSignal ? 0.8 : 0.5,
    source: 'rules',
  }
}

export const applyClassificationOverrides = (text, rawResult = {}) => {
  const ruleResult = classifyComplaintText(text)
  const rawCategory = normalizeNlpCategory(rawResult.category)
  const rawPriority = normalizeNlpPriority(rawResult.priority)
  const rawConfidence = clampConfidence(rawResult.category_confidence ?? rawResult.confidence)

  const shouldUseRuleCategory =
    ruleResult.category !== 'Other' &&
    (rawCategory === 'Other' || rawConfidence < 0.8 || rawCategory !== ruleResult.category)

  const category = shouldUseRuleCategory ? ruleResult.category : rawCategory
  const priority = ruleResult.priority !== 'MEDIUM' ? ruleResult.priority : rawPriority
  const confidence = shouldUseRuleCategory
    ? ruleResult.confidence
    : rawConfidence || ruleResult.confidence

  return {
    category,
    priority,
    confidence: Number(confidence.toFixed(2)),
    source: shouldUseRuleCategory ? 'rules' : 'nlp',
  }
}

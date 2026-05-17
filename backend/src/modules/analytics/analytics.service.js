import * as repo from './analytics.repository.js'
import { withCache } from '../../utils/cache.js'

const TTL = {
  summary: 60,
  category: 120,
  trend: 300,
  department: 120,
  priority: 120,
}

export const getSummary = () => withCache('analytics:summary', TTL.summary, repo.getSummaryStats)

export const getByCategory = () => withCache('analytics:category', TTL.category, repo.getByCategory)

export const getMonthlyTrend = () => withCache('analytics:trend', TTL.trend, repo.getMonthlyTrend)

export const getDepartmentPerf = () =>
  withCache('analytics:department', TTL.department, repo.getDepartmentPerformance)

export const getPriorityDist = () =>
  withCache('analytics:priority', TTL.priority, repo.getPriorityDistribution)

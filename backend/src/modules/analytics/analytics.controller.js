import * as analyticsService from './analytics.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js'

export const summary = async (req, res) => {
  const data = await analyticsService.getSummary()
  return ApiResponse.ok(res, data)
}

export const byCategory = async (req, res) => {
  const data = await analyticsService.getByCategory()
  return ApiResponse.ok(res, data)
}

export const monthlyTrend = async (req, res) => {
  const data = await analyticsService.getMonthlyTrend()
  return ApiResponse.ok(res, data)
}

export const departmentPerf = async (req, res) => {
  const data = await analyticsService.getDepartmentPerf()
  return ApiResponse.ok(res, data)
}

export const priorityDistribution = async (req, res) => {
  const data = await analyticsService.getPriorityDist()
  return ApiResponse.ok(res, data)
}

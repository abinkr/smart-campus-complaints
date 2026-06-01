import * as adminService from './admin.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js'

export const getAll = async (req, res) => {
  const { page, limit, ...filters } = req.query
  const { data, total } = await adminService.getAllComplaints(filters, { page, limit })

  return ApiResponse.paginated(res, data, {
    page,
    limit,
    total,
  })
}

export const update = async (req, res) => {
  const complaint = await adminService.updateComplaint(req.params.id, req.user.id, req.body)
  return ApiResponse.ok(res, complaint, 'Complaint updated')
}

export const exportCSV = async (req, res) => adminService.exportComplaints(req.query, res)

export const addPublicUpdate = async (req, res) => {
  const result = await adminService.submitPublicUpdate(req.params.id, req.user.id, req.body)
  return ApiResponse.created(res, result, 'Public update sent')
}

export const addInternalNote = async (req, res) => {
  const result = await adminService.submitInternalNote(req.params.id, req.user.id, req.body)
  return ApiResponse.created(res, result, 'Internal note saved')
}

export const updateStatus = async (req, res) => {
  const result = await adminService.patchStatus(req.params.id, req.user.id, req.body)
  return ApiResponse.ok(res, result, 'Status updated')
}

export const updateAssignment = async (req, res) => {
  const result = await adminService.patchAssignment(req.params.id, req.user.id, req.body)
  return ApiResponse.ok(res, result, 'Assignment updated')
}

export const updatePriority = async (req, res) => {
  const result = await adminService.patchPriority(req.params.id, req.user.id, req.body)
  return ApiResponse.ok(res, result, 'Priority updated')
}

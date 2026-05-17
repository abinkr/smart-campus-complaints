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

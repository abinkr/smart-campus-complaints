import * as complaintService from './complaint.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js'

export const submit = async (req, res) => {
  const complaint = await complaintService.submitComplaint(req.user.id, req.body, req.file)
  return ApiResponse.created(res, complaint, 'Complaint submitted')
}

export const getMine = async (req, res) => {
  const { data, total } = await complaintService.getMyComplaints(req.user.id, req.query)
  return ApiResponse.paginated(res, data, {
    page: req.query.page,
    limit: req.query.limit,
    total,
  })
}

export const getHistory = async (req, res) => {
  const { data, total } = await complaintService.getComplaintHistory(req.user.id, req.query)
  return ApiResponse.paginated(res, data, {
    page: req.query.page,
    limit: req.query.limit,
    total,
  })
}

export const getOne = async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.params.id, req.user)
  return ApiResponse.ok(res, complaint)
}

export const sendFollowUp = async (req, res) => {
  const followUp = await complaintService.submitFollowUp(req.params.id, req.user.id, req.body)
  return ApiResponse.created(res, followUp, 'Follow-up submitted')
}

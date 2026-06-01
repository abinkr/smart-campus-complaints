import * as notificationService from './notification.service.js'
import { ApiResponse } from '../../utils/ApiResponse.js'

export const listMine = async (req, res) => {
  const result = await notificationService.listMyNotifications(req.user.id, req.query)
  return ApiResponse.ok(res, result, 'Notifications loaded')
}

export const markRead = async (req, res) => {
  const notification = await notificationService.markMyNotificationRead(req.user.id, req.params.id)
  return ApiResponse.ok(res, notification, 'Notification marked as read')
}

export const markAllRead = async (req, res) => {
  const result = await notificationService.markAllMyNotificationsRead(req.user.id)
  return ApiResponse.ok(res, result, 'Notifications marked as read')
}

const asyncHandler = require('../../utils/asyncHandler');
const notificationService = require('./notification.service');

const createNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  return res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: notification
  });
});

const getMyNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.user.id, req.query);
  return res.status(200).json({
    success: true,
    data: result.notifications,
    pagination: result.pagination
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await notificationService.markAsRead(id);
  return res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead
};

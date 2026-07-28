const notificationRepository = require('./notification.repository');
const { BadRequestError } = require('../../utils/errors');

const createNotification = async (data) => {
  const { userId, title, message, type } = data;
  if (!userId || !title || !message) throw new BadRequestError('userId, title, and message are required');

  return notificationRepository.create({
    userId,
    title,
    message,
    type: type || 'INFO'
  });
};

const getUserNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 50, isRead } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await notificationRepository.findByUserId(userId, { skip, take, isRead });

  return {
    notifications: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const markAsRead = async (id) => {
  return notificationRepository.markAsRead(id);
};

const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
  return { userId };
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};

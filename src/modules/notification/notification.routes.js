const express = require('express');
const notificationController = require('./notification.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER'), notificationController.createNotification);
router.get('/my-notifications', notificationController.getMyNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;

const express = require('express');
const userSessionController = require('./userSession.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), userSessionController.getAllSessions);
router.get('/my-sessions', userSessionController.getMySessions);
router.delete('/:id', userSessionController.revokeSession);
router.post('/revoke-all', userSessionController.revokeAllUserSessions);

module.exports = router;

const express = require('express');
const authController = require('./auth.controller');
const { validateRegister, validateLogin, validateRefreshToken } = require('./auth.validation');

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);

module.exports = router;

const express = require('express');
const menuController = require('./menu.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

// Public routes for Customer QR Code Menu Browsing
router.get('/public/categories', menuController.getAllCategories);
router.get('/public/items', menuController.getAllMenuItems);
router.get('/public/items/:id', menuController.getMenuItemById);

router.use(authenticateToken);

// Category Routes
router.post('/category', authorizeRoles('ADMIN', 'MANAGER'), menuController.createCategory);
router.post('/categories', authorizeRoles('ADMIN', 'MANAGER'), menuController.createCategory);
router.get('/category', menuController.getAllCategories);
router.get('/categories', menuController.getAllCategories);


// Menu Item Routes
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), menuController.createMenuItem);
router.get('/', menuController.getAllMenuItems);
router.get('/:id', menuController.getMenuItemById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), menuController.updateMenuItem);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), menuController.deleteMenuItem);

module.exports = router;

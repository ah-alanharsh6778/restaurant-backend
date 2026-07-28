const express = require('express');
const ingredientController = require('./ingredient.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF', 'INVENTORY_MANAGER'), ingredientController.createIngredient);
router.get('/', ingredientController.getAllIngredients);
router.get('/:id', ingredientController.getIngredientById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'CHEF', 'INVENTORY_MANAGER'), ingredientController.updateIngredient);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), ingredientController.deleteIngredient);

module.exports = router;

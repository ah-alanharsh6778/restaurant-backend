const express = require('express');
const recipeController = require('./recipe.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), recipeController.createRecipe);
router.get('/', recipeController.getAllRecipes);
router.get('/:id', recipeController.getRecipeById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), recipeController.updateRecipe);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), recipeController.deleteRecipe);

// Recipe Ingredient routes
router.post('/ingredient', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), recipeController.addIngredientToRecipe);
router.delete('/ingredient/:id', authorizeRoles('ADMIN', 'MANAGER', 'CHEF'), recipeController.removeIngredientFromRecipe);

module.exports = router;

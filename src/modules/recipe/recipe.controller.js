const asyncHandler = require('../../utils/asyncHandler');
const recipeService = require('./recipe.service');

const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.createRecipe(req.body);
  return res.status(201).json({
    success: true,
    message: 'Recipe created successfully',
    data: recipe
  });
});

const getAllRecipes = asyncHandler(async (req, res) => {
  const result = await recipeService.getAllRecipes(req.query);
  return res.status(200).json({
    success: true,
    data: result.recipes,
    pagination: result.pagination
  });
});

const getRecipeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const recipe = await recipeService.getRecipeById(id);
  return res.status(200).json({
    success: true,
    data: recipe
  });
});

const updateRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const recipe = await recipeService.updateRecipe(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Recipe updated successfully',
    data: recipe
  });
});

const deleteRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await recipeService.deleteRecipe(id);
  return res.status(200).json({
    success: true,
    message: 'Recipe deleted successfully'
  });
});

const addIngredientToRecipe = asyncHandler(async (req, res) => {
  const recipeIngredient = await recipeService.addIngredientToRecipe(req.body);
  return res.status(201).json({
    success: true,
    message: 'Ingredient added to recipe successfully',
    data: recipeIngredient
  });
});

const removeIngredientFromRecipe = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await recipeService.removeIngredientFromRecipe(id);
  return res.status(200).json({
    success: true,
    message: 'Ingredient removed from recipe successfully'
  });
});

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addIngredientToRecipe,
  removeIngredientFromRecipe
};

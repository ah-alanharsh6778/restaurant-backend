const asyncHandler = require('../../utils/asyncHandler');
const ingredientService = require('./ingredient.service');

const createIngredient = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.createIngredient(req.body);
  return res.status(201).json({
    success: true,
    message: 'Ingredient created successfully',
    data: ingredient
  });
});

const getAllIngredients = asyncHandler(async (req, res) => {
  const result = await ingredientService.getAllIngredients(req.query);
  return res.status(200).json({
    success: true,
    data: result.ingredients,
    pagination: result.pagination
  });
});

const getIngredientById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ingredient = await ingredientService.getIngredientById(id);
  return res.status(200).json({
    success: true,
    data: ingredient
  });
});

const updateIngredient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ingredient = await ingredientService.updateIngredient(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Ingredient updated successfully',
    data: ingredient
  });
});

const deleteIngredient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ingredientService.deleteIngredient(id);
  return res.status(200).json({
    success: true,
    message: 'Ingredient deleted successfully'
  });
});

module.exports = {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient
};

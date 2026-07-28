const recipeRepository = require('./recipe.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createRecipe = async (data) => {
  const { name, description, menuItemId, ingredients } = data;

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId }
  });

  if (!menuItem) {
    throw new NotFoundError('MenuItem not found');
  }

  const existingRecipe = await recipeRepository.findByMenuItemId(menuItemId);
  if (existingRecipe) {
    throw new BadRequestError('Recipe already exists for this menu item');
  }

  const processedIngredients = [];
  if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
    for (const item of ingredients) {
      const ing = await prisma.ingredient.findUnique({ where: { id: item.ingredientId } });
      if (!ing) throw new NotFoundError(`Ingredient ${item.ingredientId} not found`);

      processedIngredients.push({
        ingredientId: item.ingredientId,
        quantity: parseFloat(item.quantity),
        unit: item.unit || ing.unit
      });
    }
  }

  const recipe = await recipeRepository.create(
    {
      name,
      description: description || null,
      menuItemId
    },
    processedIngredients
  );

  return recipe;
};

const getAllRecipes = async (query = {}) => {
  const { page = 1, limit = 50 } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await recipeRepository.findAll({ skip, take });

  // Calculate Dish Cost Price dynamically
  const recipesWithCost = items.map((recipe) => {
    let estimatedCostPrice = 0;
    if (recipe.recipeIngredients) {
      recipe.recipeIngredients.forEach((ri) => {
        const unitCost = ri.ingredient ? ri.ingredient.costPerUnit : 0;
        estimatedCostPrice += ri.quantity * unitCost;
      });
    }

    return {
      ...recipe,
      estimatedCostPrice: parseFloat(estimatedCostPrice.toFixed(2))
    };
  });

  return {
    recipes: recipesWithCost,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getRecipeById = async (id) => {
  const recipe = await recipeRepository.findById(id);
  if (!recipe) {
    throw new NotFoundError('Recipe not found');
  }

  let estimatedCostPrice = 0;
  if (recipe.recipeIngredients) {
    recipe.recipeIngredients.forEach((ri) => {
      const unitCost = ri.ingredient ? ri.ingredient.costPerUnit : 0;
      estimatedCostPrice += ri.quantity * unitCost;
    });
  }

  return {
    ...recipe,
    estimatedCostPrice: parseFloat(estimatedCostPrice.toFixed(2))
  };
};

const updateRecipe = async (id, data) => {
  const existing = await recipeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Recipe not found');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  return recipeRepository.update(id, updateData);
};

const deleteRecipe = async (id) => {
  const existing = await recipeRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Recipe not found');
  }

  await recipeRepository.delete(id);
  return { id };
};

const addIngredientToRecipe = async (data) => {
  const { recipeId, ingredientId, quantity, unit } = data;

  const recipe = await recipeRepository.findById(recipeId);
  if (!recipe) throw new NotFoundError('Recipe not found');

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId }
  });

  if (!ingredient) throw new NotFoundError('Ingredient not found');

  const existing = await prisma.recipeIngredient.findFirst({
    where: { recipeId, ingredientId }
  });

  if (existing) throw new BadRequestError('Ingredient already added to recipe');

  return recipeRepository.addIngredient(
    recipeId,
    ingredientId,
    parseFloat(quantity),
    unit || ingredient.unit
  );
};

const removeIngredientFromRecipe = async (id) => {
  const existing = await prisma.recipeIngredient.findUnique({
    where: { id }
  });

  if (!existing) throw new NotFoundError('Recipe ingredient not found');

  await recipeRepository.removeIngredient(id);
  return { id };
};

module.exports = {
  createRecipe,
  getAllRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  addIngredientToRecipe,
  removeIngredientFromRecipe
};

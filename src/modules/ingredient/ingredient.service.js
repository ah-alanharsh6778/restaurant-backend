const ingredientRepository = require('./ingredient.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { IngredientDTO } = require('../../dtos');

const createIngredient = async (data) => {
  const { name, unit, quantity, minimumStock, costPerUnit, isActive } = data;

  const existing = await ingredientRepository.findByName(name);
  if (existing) throw new BadRequestError('Ingredient name already exists');

  const ingredient = await ingredientRepository.create({
    name,
    unit,
    quantity: quantity !== undefined ? parseFloat(quantity) : 0,
    minimumStock: minimumStock !== undefined ? parseFloat(minimumStock) : 0,
    costPerUnit: costPerUnit !== undefined ? parseFloat(costPerUnit) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  return new IngredientDTO(ingredient);
};

const getAllIngredients = async (query = {}) => {
  const pageNum = parseInt(query.page, 10);
  const limitNum = parseInt(query.limit, 10);
  const page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
  const limit = !isNaN(limitNum) && limitNum > 0 ? limitNum : 50;
  const skip = (page - 1) * limit;
  const take = limit;
  const { isActive, search } = query;

  const { items, total } = await ingredientRepository.findAll({ skip, take, isActive, search });

  return {
    ingredients: items.map((ing) => new IngredientDTO(ing)),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getIngredientById = async (id) => {
  const ingredient = await ingredientRepository.findById(id);
  if (!ingredient) throw new NotFoundError('Ingredient not found');
  return new IngredientDTO(ingredient);
};

const updateIngredient = async (id, data) => {
  const existing = await ingredientRepository.findById(id);
  if (!existing) throw new NotFoundError('Ingredient not found');

  if (data.name && data.name !== existing.name) {
    const duplicate = await ingredientRepository.findByName(data.name);
    if (duplicate) throw new BadRequestError('Ingredient name already exists');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.quantity !== undefined) updateData.quantity = parseFloat(data.quantity);
  if (data.minimumStock !== undefined) updateData.minimumStock = parseFloat(data.minimumStock);
  if (data.costPerUnit !== undefined) updateData.costPerUnit = parseFloat(data.costPerUnit);
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

  const updated = await ingredientRepository.update(id, updateData);
  return new IngredientDTO(updated);
};

const deleteIngredient = async (id) => {
  const existing = await ingredientRepository.findById(id);
  if (!existing) throw new NotFoundError('Ingredient not found');
  await ingredientRepository.delete(id);
  return { id };
};

module.exports = {
  createIngredient,
  getAllIngredients,
  getIngredientById,
  updateIngredient,
  deleteIngredient
};

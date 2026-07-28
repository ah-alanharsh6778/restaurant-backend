const wasteRepository = require('./waste.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const logFoodWaste = async (data, user) => {
  const { ingredientId, quantity, unit, reason, remarks } = data;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId }
  });

  if (!ingredient) throw new NotFoundError('Ingredient not found');

  const qty = parseFloat(quantity);
  if (qty <= 0) throw new BadRequestError('Quantity must be greater than 0');

  const costLost = parseFloat((qty * ingredient.costPerUnit).toFixed(2));

  return wasteRepository.logWasteAndDeductIngredient({
    ingredientId,
    reportedById: user ? user.id : null,
    quantity: qty,
    unit: unit || ingredient.unit,
    costLost,
    reason,
    remarks: remarks || null
  });
};

const getAllWasteLogs = async (query = {}) => {
  const { page = 1, limit = 50, ingredientId, reason } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await wasteRepository.findAll({ skip, take, ingredientId, reason });

  return {
    wasteLogs: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getWasteStats = async () => {
  return wasteRepository.getWasteAnalytics();
};

module.exports = {
  logFoodWaste,
  getAllWasteLogs,
  getWasteStats
};

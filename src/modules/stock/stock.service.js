const stockRepository = require('./stock.repository');
const { BadRequestError } = require('../../utils/errors');

const adjustStock = async (data) => {
  const { warehouseId, productId, ingredientId, quantity } = data;

  if (!warehouseId) throw new BadRequestError('warehouseId is required');
  if (!productId && !ingredientId) throw new BadRequestError('Either productId or ingredientId is required');

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty < 0) throw new BadRequestError('Quantity must be a non-negative number');

  return stockRepository.adjustStock(warehouseId, productId || null, ingredientId || null, qty);
};

const getAllStocks = async (query = {}) => {
  const { page = 1, limit = 50, warehouseId } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await stockRepository.findAll({ skip, take, warehouseId });

  return {
    stocks: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getStocksByWarehouse = async (warehouseId) => {
  return stockRepository.findByWarehouseId(warehouseId);
};

module.exports = {
  adjustStock,
  getAllStocks,
  getStocksByWarehouse
};

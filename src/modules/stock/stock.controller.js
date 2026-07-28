const asyncHandler = require('../../utils/asyncHandler');
const stockService = require('./stock.service');

const adjustStock = asyncHandler(async (req, res) => {
  const stock = await stockService.adjustStock(req.body);
  return res.status(200).json({
    success: true,
    message: 'Stock adjusted successfully',
    data: stock
  });
});

const getAllStocks = asyncHandler(async (req, res) => {
  const result = await stockService.getAllStocks(req.query);
  return res.status(200).json({
    success: true,
    data: result.stocks,
    pagination: result.pagination
  });
});

const getStocksByWarehouse = asyncHandler(async (req, res) => {
  const { warehouseId } = req.params;
  const stocks = await stockService.getStocksByWarehouse(warehouseId);
  return res.status(200).json({
    success: true,
    data: stocks
  });
});

module.exports = {
  adjustStock,
  getAllStocks,
  getStocksByWarehouse
};

const asyncHandler = require('../../utils/asyncHandler');
const inventoryService = require('./inventory.service');

// Category
const createCategory = asyncHandler(async (req, res) => {
  const category = await inventoryService.createCategory(req.body);
  return res.status(201).json({
    success: true,
    message: 'Product category created successfully',
    data: category
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await inventoryService.getAllCategories();
  return res.status(200).json({
    success: true,
    data: categories
  });
});

// Product
const createProduct = asyncHandler(async (req, res) => {
  const product = await inventoryService.createProduct(req.body);
  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

const getAllProducts = asyncHandler(async (req, res) => {
  const result = await inventoryService.getAllProducts(req.query);
  return res.status(200).json({
    success: true,
    data: result.products,
    pagination: result.pagination
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await inventoryService.getProductById(id);
  return res.status(200).json({
    success: true,
    data: product
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await inventoryService.updateProduct(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: product
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await inventoryService.deleteProduct(id);
  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Warehouse
const createWarehouse = asyncHandler(async (req, res) => {
  const warehouse = await inventoryService.createWarehouse(req.body);
  return res.status(201).json({
    success: true,
    message: 'Warehouse created successfully',
    data: warehouse
  });
});

const getAllWarehouses = asyncHandler(async (req, res) => {
  const warehouses = await inventoryService.getAllWarehouses();
  return res.status(200).json({
    success: true,
    data: warehouses
  });
});

const updateWarehouse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const warehouse = await inventoryService.updateWarehouse(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Warehouse updated successfully',
    data: warehouse
  });
});

const deleteWarehouse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await inventoryService.deleteWarehouse(id);
  return res.status(200).json({
    success: true,
    message: 'Warehouse deleted successfully'
  });
});

// Stock Management
const stockIn = asyncHandler(async (req, res) => {
  const transaction = await inventoryService.stockIn(req.body);
  return res.status(200).json({
    success: true,
    message: 'Stock IN recorded successfully',
    data: transaction
  });
});

const stockOut = asyncHandler(async (req, res) => {
  const transaction = await inventoryService.stockOut(req.body);
  return res.status(200).json({
    success: true,
    message: 'Stock OUT recorded successfully',
    data: transaction
  });
});

const getStockHistory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockHistory(req.query);
  return res.status(200).json({
    success: true,
    data: result.history,
    pagination: result.pagination
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createWarehouse,
  getAllWarehouses,
  updateWarehouse,
  deleteWarehouse,
  stockIn,
  stockOut,
  getStockHistory
};

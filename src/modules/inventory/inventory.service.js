const inventoryRepository = require('./inventory.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { ProductDTO } = require('../../dtos');

// Category
const createCategory = async (data) => {
  const { name, description } = data;
  const existing = await inventoryRepository.findCategoryByName(name);
  if (existing) {
    throw new BadRequestError('Product category name already exists');
  }
  return inventoryRepository.createCategory({ name, description: description || null });
};

const getAllCategories = async () => {
  return inventoryRepository.findAllCategories();
};

// Product
const createProduct = async (data) => {
  const { name, sku, categoryId, unit, currentStock, minimumStock, maximumStock, costPrice, sellingPrice, isActive } = data;

  const category = await inventoryRepository.findCategoryById(categoryId);
  if (!category) {
    throw new NotFoundError('Product category not found');
  }

  const existingSku = await inventoryRepository.findProductBySku(sku);
  if (existingSku) {
    throw new BadRequestError('Product SKU already exists');
  }

  const product = await inventoryRepository.createProduct({
    name,
    sku,
    categoryId,
    unit,
    currentStock: currentStock !== undefined ? parseFloat(currentStock) : 0,
    minimumStock: minimumStock !== undefined ? parseFloat(minimumStock) : 0,
    maximumStock: maximumStock !== undefined && maximumStock !== null ? parseFloat(maximumStock) : null,
    costPrice: parseFloat(costPrice),
    sellingPrice: parseFloat(sellingPrice),
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  return new ProductDTO(product);
};

const getAllProducts = async (query = {}) => {
  const { page = 1, limit = 50, categoryId, isActive } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await inventoryRepository.findAllProducts({ skip, take, categoryId, isActive });

  return {
    products: items.map((p) => new ProductDTO(p)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getProductById = async (id) => {
  const product = await inventoryRepository.findProductById(id);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return new ProductDTO(product);
};

const updateProduct = async (id, data) => {
  const existingProduct = await inventoryRepository.findProductById(id);
  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }

  if (data.sku && data.sku !== existingProduct.sku) {
    const duplicateSku = await inventoryRepository.findProductBySku(data.sku);
    if (duplicateSku) {
      throw new BadRequestError('Product SKU already exists');
    }
  }

  if (data.categoryId && data.categoryId !== existingProduct.categoryId) {
    const category = await inventoryRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Product category not found');
    }
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.currentStock !== undefined) updateData.currentStock = parseFloat(data.currentStock);
  if (data.minimumStock !== undefined) updateData.minimumStock = parseFloat(data.minimumStock);
  if (data.maximumStock !== undefined) updateData.maximumStock = data.maximumStock !== null ? parseFloat(data.maximumStock) : null;
  if (data.costPrice !== undefined) updateData.costPrice = parseFloat(data.costPrice);
  if (data.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(data.sellingPrice);
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

  const updatedProduct = await inventoryRepository.updateProduct(id, updateData);
  return new ProductDTO(updatedProduct);
};

const deleteProduct = async (id) => {
  const existingProduct = await inventoryRepository.findProductById(id);
  if (!existingProduct) {
    throw new NotFoundError('Product not found');
  }
  await inventoryRepository.deleteProduct(id);
  return { id };
};

// Warehouse
const createWarehouse = async (data) => {
  const { name, location, manager } = data;
  const existing = await inventoryRepository.findWarehouseByName(name);
  if (existing) {
    throw new BadRequestError('Warehouse name already exists');
  }
  return inventoryRepository.createWarehouse({ name, location, manager: manager || null });
};

const getAllWarehouses = async () => {
  return inventoryRepository.findAllWarehouses();
};

const updateWarehouse = async (id, data) => {
  const existing = await inventoryRepository.findWarehouseById(id);
  if (!existing) {
    throw new NotFoundError('Warehouse not found');
  }

  if (data.name && data.name !== existing.name) {
    const duplicate = await inventoryRepository.findWarehouseByName(data.name);
    if (duplicate) {
      throw new BadRequestError('Warehouse name already exists');
    }
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.manager !== undefined) updateData.manager = data.manager || null;

  return inventoryRepository.updateWarehouse(id, updateData);
};

const deleteWarehouse = async (id) => {
  const existing = await inventoryRepository.findWarehouseById(id);
  if (!existing) {
    throw new NotFoundError('Warehouse not found');
  }
  await inventoryRepository.deleteWarehouse(id);
  return { id };
};

// Stock Transactions
const stockIn = async (data) => {
  const { productId, warehouseId, quantity, remarks } = data;
  const qty = parseFloat(quantity);
  if (qty <= 0) throw new BadRequestError('Quantity must be greater than 0');

  const product = await inventoryRepository.findProductById(productId);
  if (!product) throw new NotFoundError('Product not found');

  const warehouse = await inventoryRepository.findWarehouseById(warehouseId);
  if (!warehouse) throw new NotFoundError('Warehouse not found');

  return inventoryRepository.recordStockIn(productId, warehouseId, qty, remarks);
};

const stockOut = async (data) => {
  const { productId, warehouseId, quantity, remarks } = data;
  const qty = parseFloat(quantity);
  if (qty <= 0) throw new BadRequestError('Quantity must be greater than 0');

  const product = await inventoryRepository.findProductById(productId);
  if (!product) throw new NotFoundError('Product not found');

  const warehouse = await inventoryRepository.findWarehouseById(warehouseId);
  if (!warehouse) throw new NotFoundError('Warehouse not found');

  if (product.currentStock < qty) {
    throw new BadRequestError(`Insufficient stock. Current stock is ${product.currentStock}`);
  }

  return inventoryRepository.recordStockOut(productId, warehouseId, qty, remarks);
};

const getStockHistory = async (query = {}) => {
  const { page = 1, limit = 50, productId, warehouseId, type } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await inventoryRepository.getStockHistory({ skip, take, productId, warehouseId, type });

  return {
    history: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

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

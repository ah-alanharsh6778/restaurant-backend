const prisma = require('../../config/prisma');

class InventoryRepository {
  // Product Category
  async createCategory(data) {
    return prisma.productCategory.create({ data });
  }

  async findCategoryByName(name) {
    return prisma.productCategory.findUnique({ where: { name } });
  }

  async findCategoryById(id) {
    return prisma.productCategory.findUnique({ where: { id } });
  }

  async findAllCategories() {
    return prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  }

  // Product
  async createProduct(data) {
    return prisma.product.create({
      data,
      include: { category: true }
    });
  }

  async findProductBySku(sku) {
    return prisma.product.findUnique({
      where: { sku },
      include: { category: true }
    });
  }

  async findProductById(id) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });
  }

  async findAllProducts(options = {}) {
    const { skip, take, categoryId, isActive } = options;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { category: true },
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    return { items, total };
  }

  async updateProduct(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async deleteProduct(id) {
    return prisma.product.delete({ where: { id } });
  }

  // Warehouse
  async createWarehouse(data) {
    return prisma.warehouse.create({ data });
  }

  async findWarehouseByName(name) {
    return prisma.warehouse.findUnique({ where: { name } });
  }

  async findWarehouseById(id) {
    return prisma.warehouse.findUnique({ where: { id } });
  }

  async findAllWarehouses() {
    return prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
  }

  async updateWarehouse(id, data) {
    return prisma.warehouse.update({ where: { id }, data });
  }

  async deleteWarehouse(id) {
    return prisma.warehouse.delete({ where: { id } });
  }

  // Stock Movement Transactions
  async recordStockIn(productId, warehouseId, quantity, remarks) {
    return prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: { increment: quantity } }
      });

      return tx.stockTransaction.create({
        data: {
          productId,
          warehouseId,
          type: 'STOCK_IN',
          quantity,
          remarks: remarks || null
        },
        include: { product: true, warehouse: true }
      });
    });
  }

  async recordStockOut(productId, warehouseId, quantity, remarks) {
    return prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: quantity } }
      });

      return tx.stockTransaction.create({
        data: {
          productId,
          warehouseId,
          type: 'STOCK_OUT',
          quantity,
          remarks: remarks || null
        },
        include: { product: true, warehouse: true }
      });
    });
  }

  async getStockHistory(options = {}) {
    const { skip, take, productId, warehouseId, type } = options;
    const where = {};
    if (productId) where.productId = productId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { product: true, warehouse: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockTransaction.count({ where })
    ]);

    return { items, total };
  }
}

module.exports = new InventoryRepository();

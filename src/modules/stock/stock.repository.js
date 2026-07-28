const prisma = require('../../config/prisma');

class StockRepository {
  async adjustStock(warehouseId, productId, ingredientId, quantity) {
    return prisma.$transaction(async (tx) => {
      let stock = null;
      if (productId) {
        stock = await tx.stock.upsert({
          where: {
            productId_warehouseId: { productId, warehouseId }
          },
          update: { quantity },
          create: { productId, warehouseId, quantity },
          include: { product: true, warehouse: true }
        });
      } else if (ingredientId) {
        stock = await tx.stock.upsert({
          where: {
            ingredientId_warehouseId: { ingredientId, warehouseId }
          },
          update: { quantity },
          create: { ingredientId, warehouseId, quantity },
          include: { ingredient: true, warehouse: true }
        });
      }

      return stock;
    });
  }

  async findAll(options = {}) {
    const { skip, take, warehouseId } = options;
    const where = {};
    if (warehouseId) where.warehouseId = warehouseId;

    const [items, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { product: true, ingredient: true, warehouse: true },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.stock.count({ where })
    ]);

    return { items, total };
  }

  async findByWarehouseId(warehouseId) {
    return prisma.stock.findMany({
      where: { warehouseId },
      include: { product: true, ingredient: true, warehouse: true }
    });
  }
}

module.exports = new StockRepository();

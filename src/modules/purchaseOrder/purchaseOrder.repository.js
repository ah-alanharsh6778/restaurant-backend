const prisma = require('../../config/prisma');

class PurchaseOrderRepository {
  async create(poData, itemsData) {
    return prisma.purchaseOrder.create({
      data: {
        ...poData,
        purchaseItems: {
          create: itemsData
        }
      },
      include: {
        supplier: true,
        purchaseItems: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findById(id) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseItems: {
          include: { ingredient: true }
        }
      }
    });
  }

  async findByPoNumber(poNumber) {
    return prisma.purchaseOrder.findUnique({
      where: { poNumber }
    });
  }

  async findAll(options = {}) {
    const { skip, take, supplierId, status } = options;
    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: {
          supplier: true,
          purchaseItems: {
            include: { ingredient: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    return { items, total };
  }

  async updateStatusAndReceiveStock(poId, status, itemsToReceive = []) {
    return prisma.$transaction(async (tx) => {
      const updatedPO = await tx.purchaseOrder.update({
        where: { id: poId },
        data: { status },
        include: {
          supplier: true,
          purchaseItems: { include: { ingredient: true } }
        }
      });

      for (const item of itemsToReceive) {
        await tx.ingredient.update({
          where: { id: item.ingredientId },
          data: {
            quantity: {
              increment: item.quantity
            }
          }
        });
      }

      return updatedPO;
    });
  }

  async delete(id) {
    return prisma.$transaction(async (tx) => {
      await tx.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      return tx.purchaseOrder.delete({ where: { id } });
    });
  }
}

module.exports = new PurchaseOrderRepository();

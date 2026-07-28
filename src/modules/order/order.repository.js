const prisma = require('../../config/prisma');

class OrderRepository {
  async create(orderData, processedItems) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          orderItems: {
            create: processedItems
          }
        },
        include: {
          table: true,
          waiter: true,
          orderItems: {
            include: { menuItem: true }
          }
        }
      });

      if (orderData.tableId) {
        await tx.restaurantTable.update({
          where: { id: orderData.tableId },
          data: { status: 'OCCUPIED' }
        });
      }

      return order;
    });
  }

  async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: true,
        orderItems: {
          include: {
            menuItem: {
              include: {
                recipe: {
                  include: {
                    recipeIngredients: {
                      include: { ingredient: true }
                    }
                  }
                }
              }
            }
          }
        },
        payments: true
      }
    });
  }

  async findAll(options = {}) {
    const { skip, take, status, tableId, waiterId } = options;
    const where = {};
    if (status) where.status = status;
    if (tableId) where.tableId = tableId;
    if (waiterId) where.waiterId = waiterId;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: {
          table: true,
          waiter: true,
          orderItems: {
            include: { menuItem: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    return { items, total };
  }

  async updateOrderFields(orderId, updateFields, ingredientsToDeduct = []) {
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateFields,
        include: {
          table: true,
          waiter: true,
          orderItems: { include: { menuItem: true } },
          payments: true
        }
      });

      for (const item of ingredientsToDeduct) {
        await tx.ingredient.update({
          where: { id: item.ingredientId },
          data: {
            quantity: {
              decrement: item.quantityToDeduct
            }
          }
        });
      }

      return updatedOrder;
    });
  }

  async updateStatusAndDeductIngredients(orderId, status, ingredientsToDeduct = []) {
    return this.updateOrderFields(orderId, { status }, ingredientsToDeduct);
  }

  async addOrderItem(orderId, itemData) {
    return prisma.orderItem.create({
      data: {
        orderId,
        ...itemData
      },
      include: {
        menuItem: true,
        order: true
      }
    });
  }

  async removeOrderItem(id) {
    return prisma.orderItem.delete({
      where: { id }
    });
  }

  async updateOrderTotal(orderId, totalAmount, finalAmount) {
    return prisma.order.update({
      where: { id: orderId },
      data: { totalAmount, finalAmount }
    });
  }

  async delete(id) {
    return prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId: id } });
      return tx.order.delete({ where: { id } });
    });
  }
}

module.exports = new OrderRepository();

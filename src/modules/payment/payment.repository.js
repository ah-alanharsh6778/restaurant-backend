const prisma = require('../../config/prisma');

class PaymentRepository {
  async processPaymentAndUpdateOrder(orderId, paymentData) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId,
          ...paymentData
        },
        include: {
          order: true,
          processedBy: true
        }
      });

      if (paymentData.paymentStatus === 'PAID') {
        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: 'COMPLETED' }
        });

        if (updatedOrder && updatedOrder.tableId) {
          await tx.restaurantTable.update({
            where: { id: updatedOrder.tableId },
            data: { status: 'AVAILABLE' }
          });
        }
      }

      return payment;
    });
  }

  async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: true, processedBy: true }
    });
  }

  async findByOrderId(orderId) {
    return prisma.payment.findMany({
      where: { orderId },
      include: { processedBy: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAll(options = {}) {
    const { skip, take, paymentMethod, paymentStatus } = options;
    const where = {};
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { order: true, processedBy: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    return { items, total };
  }
}

module.exports = new PaymentRepository();

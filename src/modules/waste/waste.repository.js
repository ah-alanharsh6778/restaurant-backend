const prisma = require('../../config/prisma');

class WasteRepository {
  async logWasteAndDeductIngredient(data) {
    return prisma.$transaction(async (tx) => {
      const wasteLog = await tx.foodWasteLog.create({
        data,
        include: {
          ingredient: true,
          reportedBy: true
        }
      });

      await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          quantity: {
            decrement: data.quantity
          }
        }
      });

      return wasteLog;
    });
  }

  async findById(id) {
    return prisma.foodWasteLog.findUnique({
      where: { id },
      include: { ingredient: true, reportedBy: true }
    });
  }

  async findAll(options = {}) {
    const { skip, take, ingredientId, reason } = options;
    const where = {};
    if (ingredientId) where.ingredientId = ingredientId;
    if (reason) where.reason = reason;

    const [items, total] = await Promise.all([
      prisma.foodWasteLog.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { ingredient: true, reportedBy: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.foodWasteLog.count({ where })
    ]);

    return { items, total };
  }

  async getWasteAnalytics() {
    const logs = await prisma.foodWasteLog.findMany({
      include: { ingredient: true }
    });

    const totalCostLost = logs.reduce((acc, log) => acc + log.costLost, 0);

    const wasteByReason = {};
    logs.forEach((log) => {
      if (!wasteByReason[log.reason]) wasteByReason[log.reason] = 0;
      wasteByReason[log.reason] += log.costLost;
    });

    return {
      totalWasteEntries: logs.length,
      totalCostLost: parseFloat(totalCostLost.toFixed(2)),
      wasteByReason: Object.keys(wasteByReason).map((r) => ({
        reason: r,
        costLost: parseFloat(wasteByReason[r].toFixed(2))
      }))
    };
  }
}

module.exports = new WasteRepository();

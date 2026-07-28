const prisma = require('../../config/prisma');

class DashboardRepository {
  // Sales Overview Aggregation
  async getSalesOverview() {
    const [completedAgg, totalOrdersCount] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true, finalAmount: true },
        _count: { id: true },
        _avg: { finalAmount: true }
      }),
      prisma.order.count()
    ]);

    const totalRevenue = completedAgg._sum.finalAmount || completedAgg._sum.totalAmount || 0;
    const completedOrdersCount = completedAgg._count.id || 0;
    const avgOrderValue = completedAgg._avg.finalAmount || 0;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      completedOrdersCount,
      totalOrdersCount,
      avgOrderValue: parseFloat(avgOrderValue.toFixed(2))
    };
  }

  // Orders Breakdown Aggregation
  async getOrdersBreakdown() {
    const counts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const statusMap = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    counts.forEach((c) => {
      statusMap[c.status] = c._count.id;
    });

    return statusMap;
  }

  // Revenue Aggregation
  async getRevenueMetrics() {
    const [revenueCompleted, revenuePending] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalAmount: true }
      }),
      prisma.order.aggregate({
        where: { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
        _sum: { finalAmount: true }
      })
    ]);

    return {
      completedRevenue: revenueCompleted._sum.finalAmount || 0,
      pendingRevenue: revenuePending._sum.finalAmount || 0,
      totalPotentialRevenue: (revenueCompleted._sum.finalAmount || 0) + (revenuePending._sum.finalAmount || 0)
    };
  }

  // Profit Calculation (Revenue - Expenses)
  async getProfitMetrics() {
    const [revenueAgg, expenseAgg] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalAmount: true }
      }),
      prisma.expense.aggregate({
        _sum: { total: true }
      })
    ]);

    const totalRevenue = revenueAgg._sum.finalAmount || 0;
    const totalExpenses = expenseAgg._sum.total || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitMarginPercent: parseFloat(profitMargin.toFixed(1))
    };
  }

  // Table Occupancy Stats
  async getTableOccupancy() {
    const tablesGrouped = await prisma.restaurantTable.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    let total = 0;
    const breakdown = { AVAILABLE: 0, OCCUPIED: 0, RESERVED: 0, MAINTENANCE: 0 };

    tablesGrouped.forEach((g) => {
      breakdown[g.status] = g._count.id;
      total += g._count.id;
    });

    const occupancyRate = total > 0 ? (breakdown.OCCUPIED / total) * 100 : 0;

    return {
      totalTables: total,
      availableTables: breakdown.AVAILABLE,
      occupiedTables: breakdown.OCCUPIED,
      reservedTables: breakdown.RESERVED,
      maintenanceTables: breakdown.MAINTENANCE,
      occupancyRatePercent: parseFloat(occupancyRate.toFixed(1))
    };
  }

  // Low Stock Detection
  async getLowStockItems() {
    const [lowStockIngredients, lowStockProducts] = await Promise.all([
      prisma.ingredient.findMany({
        where: { quantity: { lte: prisma.ingredient.fields.minimumStock } },
        select: { id: true, name: true, unit: true, quantity: true, minimumStock: true }
      }),
      prisma.product.findMany({
        where: { currentStock: { lte: prisma.product.fields.minimumStock } },
        select: { id: true, name: true, sku: true, unit: true, currentStock: true, minimumStock: true }
      })
    ]);

    return {
      lowStockIngredients,
      lowStockProducts,
      totalAlerts: lowStockIngredients.length + lowStockProducts.length
    };
  }

  // Purchase Summary
  async getPurchaseSummary() {
    const [poCounts, poSpend] = await Promise.all([
      prisma.purchaseOrder.groupBy({
        by: ['status'],
        _count: { id: true }
      }),
      prisma.purchaseOrder.aggregate({
        _sum: { totalAmount: true }
      })
    ]);

    const statusCounts = { PENDING: 0, ORDERED: 0, RECEIVED: 0, CANCELLED: 0 };
    let totalPo = 0;

    poCounts.forEach((c) => {
      statusCounts[c.status] = c._count.id;
      totalPo += c._count.id;
    });

    return {
      totalPurchaseOrders: totalPo,
      statusBreakdown: statusCounts,
      totalPurchaseSpend: parseFloat((poSpend._sum.totalAmount || 0).toFixed(2))
    };
  }

  // Monthly Expenses (12 Months)
  async getMonthlyExpenses() {
    const expenses = await prisma.expense.findMany({
      select: { createdAt: true, total: true }
    });

    const monthlyMap = {};

    expenses.forEach((exp) => {
      const date = new Date(exp.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
      monthlyMap[monthKey] += exp.total;
    });

    return Object.keys(monthlyMap).sort().map((month) => ({
      month,
      expenseTotal: parseFloat(monthlyMap[month].toFixed(2))
    }));
  }

  // Supplier Summary
  async getSupplierSummary() {
    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: { select: { purchaseOrders: true, expenses: true } }
      }
    });

    return suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      totalPurchaseOrders: s._count.purchaseOrders,
      totalExpenses: s._count.expenses
    }));
  }

  // Top Selling Menu Items
  async getTopSellingMenu(limit = 5) {
    const topItems = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit
    });

    const menuItemIds = topItems.map((t) => t.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
      select: { id: true, name: true, price: true, category: { select: { name: true } } }
    });

    const menuItemMap = new Map(menuItems.map((m) => [m.id, m]));

    return topItems.map((t) => {
      const item = menuItemMap.get(t.menuItemId);
      return {
        menuItemId: t.menuItemId,
        name: item ? item.name : 'Unknown Item',
        category: item && item.category ? item.category.name : 'Uncategorized',
        price: item ? item.price : 0,
        totalQuantitySold: t._sum.quantity || 0,
        totalRevenueGenerated: parseFloat((t._sum.subtotal || 0).toFixed(2))
      };
    });
  }

  // Weekly Sales Aggregation
  async getWeeklySales() {
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { createdAt: true, finalAmount: true }
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyMap = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };

    completedOrders.forEach((order) => {
      const dayName = days[new Date(order.createdAt).getDay()];
      weeklyMap[dayName] += order.finalAmount;
    });

    return Object.keys(weeklyMap).map((day) => ({
      day,
      sales: parseFloat(weeklyMap[day].toFixed(2))
    }));
  }

  // Monthly Sales Aggregation
  async getMonthlySales() {
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { createdAt: true, finalAmount: true }
    });

    const monthlyMap = {};

    completedOrders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = 0;
      monthlyMap[monthKey] += order.finalAmount;
    });

    return Object.keys(monthlyMap).sort().map((month) => ({
      month,
      sales: parseFloat(monthlyMap[month].toFixed(2))
    }));
  }

  // Yearly Sales Aggregation
  async getYearlySales() {
    const completedOrders = await prisma.order.findMany({
      where: { status: 'COMPLETED' },
      select: { createdAt: true, finalAmount: true }
    });

    const yearlyMap = {};

    completedOrders.forEach((order) => {
      const year = new Date(order.createdAt).getFullYear().toString();
      if (!yearlyMap[year]) yearlyMap[year] = 0;
      yearlyMap[year] += order.finalAmount;
    });

    return Object.keys(yearlyMap).sort().map((year) => ({
      year,
      sales: parseFloat(yearlyMap[year].toFixed(2))
    }));
  }
}

module.exports = new DashboardRepository();

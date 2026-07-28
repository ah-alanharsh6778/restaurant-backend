const prisma = require('../../config/prisma');

class ExpenseRepository {
  // Expense Category
  async createCategory(data) {
    return prisma.expenseCategory.create({ data });
  }

  async findCategoryByName(name) {
    return prisma.expenseCategory.findUnique({ where: { name } });
  }

  async findCategoryById(id) {
    return prisma.expenseCategory.findUnique({ where: { id } });
  }

  async findAllCategories() {
    return prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async updateCategory(id, data) {
    return prisma.expenseCategory.update({ where: { id }, data });
  }

  async deleteCategory(id) {
    return prisma.expenseCategory.delete({ where: { id } });
  }

  // Expense CRUD
  async createExpense(data) {
    return prisma.expense.create({
      data,
      include: { supplier: true, category: true }
    });
  }

  async findExpenseById(id) {
    return prisma.expense.findUnique({
      where: { id },
      include: { supplier: true, category: true }
    });
  }

  async findAllExpenses(options = {}) {
    const { skip, take, supplierId, categoryId, status } = options;
    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { supplier: true, category: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.expense.count({ where })
    ]);

    return { items, total };
  }

  async updateExpense(id, data) {
    return prisma.expense.update({
      where: { id },
      data,
      include: { supplier: true, category: true }
    });
  }

  async deleteExpense(id) {
    return prisma.expense.delete({ where: { id } });
  }
}

module.exports = new ExpenseRepository();

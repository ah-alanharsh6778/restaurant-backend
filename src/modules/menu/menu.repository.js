const prisma = require('../../config/prisma');

class MenuRepository {
  // Category operations
  async createCategory(data) {
    return prisma.menuCategory.create({ data });
  }

  async findCategoryByName(name) {
    return prisma.menuCategory.findUnique({ where: { name } });
  }

  async findCategoryById(id) {
    return prisma.menuCategory.findUnique({ where: { id } });
  }

  async findAllCategories() {
    return prisma.menuCategory.findMany({
      orderBy: { name: 'asc' }
    });
  }

  // Menu item operations
  async createMenuItem(data) {
    return prisma.menuItem.create({
      data,
      include: { category: true }
    });
  }

  async findMenuItemById(id) {
    return prisma.menuItem.findUnique({
      where: { id },
      include: { category: true, recipe: true }
    });
  }

  async findAllMenuItems(options = {}) {
    const { skip, take, categoryId, isAvailable } = options;
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (isAvailable !== undefined) where.isAvailable = isAvailable === 'true';

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { category: true },
        orderBy: { name: 'asc' }
      }),
      prisma.menuItem.count({ where })
    ]);

    return { items, total };
  }

  async updateMenuItem(id, data) {
    return prisma.menuItem.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async deleteMenuItem(id) {
    return prisma.menuItem.delete({
      where: { id }
    });
  }
}

module.exports = new MenuRepository();

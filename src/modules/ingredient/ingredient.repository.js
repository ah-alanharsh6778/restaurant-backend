const prisma = require('../../config/prisma');

class IngredientRepository {
  async create(data) {
    return prisma.ingredient.create({ data });
  }

  async findById(id) {
    return prisma.ingredient.findFirst({ where: { id, isDeleted: false } });
  }

  async findByName(name) {
    return prisma.ingredient.findUnique({ where: { name } });
  }

  async findAll(options = {}) {
    const { skip, take, isActive, search } = options;
    const where = { isDeleted: false };

    if (isActive !== undefined && isActive !== 'ALL' && isActive !== '') {
      where.isActive = isActive === 'true' || isActive === true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    const validSkip = Number.isInteger(skip) && skip >= 0 ? skip : undefined;
    const validTake = Number.isInteger(take) && take > 0 ? take : undefined;

    const [items, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        skip: validSkip,
        take: validTake,
        orderBy: { name: 'asc' }
      }),
      prisma.ingredient.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.ingredient.update({ where: { id }, data });
  }

  async delete(id) {
    const existing = await prisma.ingredient.findUnique({ where: { id } });
    if (!existing) return null;
    return prisma.ingredient.update({
      where: { id },
      data: {
        name: `${existing.name} (deleted-${id.slice(0, 8)})`,
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false
      }
    });
  }
}

module.exports = new IngredientRepository();

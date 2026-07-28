const prisma = require('../../config/prisma');

class RoleRepository {
  async create(data) {
    return prisma.role.create({ data });
  }

  async findById(id) {
    return prisma.role.findUnique({
      where: { id },
      include: { users: true }
    });
  }

  async findByName(name) {
    return prisma.role.findUnique({ where: { name } });
  }

  async findAll(options = {}) {
    const { skip, take, search, sortBy = 'name', sortOrder = 'asc' } = options;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { [sortBy]: sortOrder },
        include: { _count: { select: { users: true } } }
      }),
      prisma.role.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.role.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.role.delete({ where: { id } });
  }
}

module.exports = new RoleRepository();

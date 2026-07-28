const prisma = require('../../config/prisma');

class SupplierRepository {
  async create(data) {
    return prisma.supplier.create({ data });
  }

  async findById(id) {
    return prisma.supplier.findUnique({ where: { id } });
  }

  async findByName(name) {
    return prisma.supplier.findUnique({ where: { name } });
  }

  async findByEmail(email) {
    return prisma.supplier.findUnique({ where: { email } });
  }

  async findByGstNumber(gstNumber) {
    return prisma.supplier.findUnique({ where: { gstNumber } });
  }

  async findAll(options = {}) {
    const { skip, take, isActive } = options;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [items, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { name: 'asc' }
      }),
      prisma.supplier.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.supplier.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.supplier.delete({ where: { id } });
  }
}

module.exports = new SupplierRepository();

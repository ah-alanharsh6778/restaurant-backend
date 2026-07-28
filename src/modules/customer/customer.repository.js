const prisma = require('../../config/prisma');

class CustomerRepository {
  async create(data) {
    return prisma.customer.create({ data });
  }

  async findById(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: { orders: true }
    });
  }

  async findByPhone(phone) {
    return prisma.customer.findUnique({ where: { phone } });
  }

  async findByEmail(email) {
    return prisma.customer.findUnique({ where: { email } });
  }

  async findAll(options = {}) {
    const { skip, take, search } = options;
    const where = { isDeleted: false };

    if (search) {
      where.AND = [
        { isDeleted: false },
        {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.customer.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.customer.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }
}

module.exports = new CustomerRepository();

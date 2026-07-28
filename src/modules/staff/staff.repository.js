const prisma = require('../../config/prisma');

class StaffRepository {
  async create(data) {
    return prisma.staff.create({
      data,
      include: { user: { include: { role: true } } }
    });
  }

  async findById(id) {
    return prisma.staff.findUnique({
      where: { id },
      include: { user: { include: { role: true } } }
    });
  }

  async findByEmployeeCode(employeeCode) {
    return prisma.staff.findUnique({
      where: { employeeCode },
      include: { user: true }
    });
  }

  async findByUserId(userId) {
    return prisma.staff.findUnique({
      where: { userId },
      include: { user: { include: { role: true } } }
    });
  }

  async findAll(options = {}) {
    const { skip, take, search, department, shift, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const where = {};

    if (department) where.department = department;
    if (shift) where.shift = shift;
    if (search) {
      where.OR = [
        { employeeCode: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
        { user: { fullName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { user: { include: { role: true } } },
        orderBy: { [sortBy]: sortOrder }
      }),
      prisma.staff.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.staff.update({
      where: { id },
      data,
      include: { user: { include: { role: true } } }
    });
  }

  async delete(id) {
    return prisma.staff.delete({ where: { id } });
  }
}

module.exports = new StaffRepository();

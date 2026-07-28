const prisma = require('../../config/prisma');

class SupplierInvoiceRepository {
  async create(data) {
    return prisma.supplierInvoice.create({
      data,
      include: {
        supplier: true,
        purchaseOrder: true
      }
    });
  }

  async findById(id) {
    return prisma.supplierInvoice.findUnique({
      where: { id },
      include: { supplier: true, purchaseOrder: true, expenses: true }
    });
  }

  async findByInvoiceNumber(invoiceNumber) {
    return prisma.supplierInvoice.findUnique({
      where: { invoiceNumber }
    });
  }

  async findAll(options = {}) {
    const { skip, take, supplierId, status } = options;
    const where = {};
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.supplierInvoice.findMany({
        where,
        skip: skip !== undefined ? parseInt(skip, 10) : undefined,
        take: take !== undefined ? parseInt(take, 10) : undefined,
        include: { supplier: true, purchaseOrder: true },
        orderBy: { invoiceDate: 'desc' }
      }),
      prisma.supplierInvoice.count({ where })
    ]);

    return { items, total };
  }

  async update(id, data) {
    return prisma.supplierInvoice.update({
      where: { id },
      data,
      include: { supplier: true, purchaseOrder: true }
    });
  }
}

module.exports = new SupplierInvoiceRepository();

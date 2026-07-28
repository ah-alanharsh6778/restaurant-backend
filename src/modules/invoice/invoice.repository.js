const prisma = require('../../config/prisma');

class InvoiceRepository {
  async createUpload(data) {
    return prisma.invoice.create({
      data: {
        filePath: data.filePath,
        status: data.status || 'UPLOADED',
        currency: data.currency || 'USD'
      }
    });
  }

  async findById(id) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        expense: {
          include: { supplier: true, category: true }
        }
      }
    });
  }

  async findDuplicate(invoiceNumber, supplierName, excludeId) {
    if (!invoiceNumber || !supplierName) return null;
    const where = {
      invoiceNumber: { equals: invoiceNumber, mode: 'insensitive' },
      supplierName: { equals: supplierName, mode: 'insensitive' }
    };
    if (excludeId) where.NOT = { id: excludeId };

    return prisma.invoice.findFirst({
      where,
      include: {
        items: true,
        expense: {
          include: { supplier: true, category: true }
        }
      }
    });
  }

  async createProcessedInvoice(invoiceData, itemsData) {
    return prisma.$transaction(async (tx) => {
      let supplierId = null;
      if (invoiceData.supplierName) {
        let supplier = await tx.supplier.findFirst({
          where: { name: { equals: invoiceData.supplierName, mode: 'insensitive' } }
        });

        if (!supplier) {
          supplier = await tx.supplier.create({
            data: {
              name: invoiceData.supplierName,
              contactPerson: 'Accounts Payable',
              phone: '+1-555-0100',
              email: `billing@${invoiceData.supplierName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
              address: 'Extracted Invoice Address'
            }
          });
        }
        supplierId = supplier.id;
      }

      let expenseCategory = await tx.expenseCategory.findFirst({
        where: { name: 'Raw Food Supplies' }
      });
      if (!expenseCategory) {
        expenseCategory = await tx.expenseCategory.create({
          data: { name: 'Raw Food Supplies', description: 'Kitchen raw materials and inventory invoices' }
        });
      }

      const expense = await tx.expense.create({
        data: {
          supplierId,
          categoryId: expenseCategory.id,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          amount: invoiceData.subtotal || invoiceData.totalAmount,
          tax: invoiceData.taxAmount || 0,
          total: invoiceData.totalAmount,
          status: 'PAID',
          filePath: invoiceData.filePath,
          remarks: `Auto-generated from AI Processed Invoice #${invoiceData.invoiceNumber}`
        }
      });

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: invoiceData.invoiceNumber,
          supplierName: invoiceData.supplierName,
          supplierTaxId: invoiceData.supplierTaxId,
          clientName: invoiceData.clientName,
          clientTaxId: invoiceData.clientTaxId,
          invoiceDate: invoiceData.invoiceDate,
          subtotal: invoiceData.subtotal,
          taxAmount: invoiceData.taxAmount,
          discount: invoiceData.discount,
          totalAmount: invoiceData.totalAmount,
          currency: invoiceData.currency || 'USD',
          status: 'PROCESSED',
          rawText: invoiceData.rawText,
          filePath: invoiceData.filePath,
          expenseId: expense.id,
          items: {
            create: itemsData.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
            }))
          }
        },
        include: {
          items: true,
          expense: {
            include: { supplier: true, category: true }
          }
        }
      });

      return invoice;
    });
  }

  async createFailedInvoice(filePath, errorMessage) {
    return prisma.invoice.create({
      data: {
        filePath,
        status: 'FAILED',
        errorMessage
      }
    });
  }

  async findAll(options = {}) {
    const { skip = 0, take = 50, status, search } = options;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { supplierName: { contains: search, mode: 'insensitive' } },
        { clientName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: parseInt(skip, 10),
        take: parseInt(take, 10),
        include: {
          items: true,
          expense: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.invoice.count({ where })
    ]);

    return { items, total };
  }

  async updateProcessResult(id, invoiceData, itemsData, expenseData) {
    return prisma.$transaction(async (tx) => {
      // 1. Create or Find Supplier if supplierName exists
      let supplierId = null;
      if (invoiceData.supplierName) {
        let supplier = await tx.supplier.findFirst({
          where: { name: { equals: invoiceData.supplierName, mode: 'insensitive' } }
        });

        if (!supplier) {
          supplier = await tx.supplier.create({
            data: {
              name: invoiceData.supplierName,
              contactPerson: 'Accounts Payable',
              phone: '+1-555-0100',
              email: `billing@${invoiceData.supplierName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
              address: 'Extracted Invoice Address'
            }
          });
        }
        supplierId = supplier.id;
      }

      // 2. Find or default ExpenseCategory
      let expenseCategory = await tx.expenseCategory.findFirst({
        where: { name: 'Raw Food Supplies' }
      });
      if (!expenseCategory) {
        expenseCategory = await tx.expenseCategory.create({
          data: { name: 'Raw Food Supplies', description: 'Kitchen raw materials and inventory invoices' }
        });
      }

      // 3. Create Expense Entry
      const expense = await tx.expense.create({
        data: {
          supplierId,
          categoryId: expenseCategory.id,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          amount: invoiceData.subtotal || invoiceData.totalAmount,
          tax: invoiceData.taxAmount || 0,
          total: invoiceData.totalAmount,
          status: 'PAID',
          filePath: invoiceData.filePath,
          remarks: `Auto-generated from AI Processed Invoice #${invoiceData.invoiceNumber || id}`
        }
      });

      // 4. Delete existing items if re-processing
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

      // 5. Update Invoice & create items
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          invoiceNumber: invoiceData.invoiceNumber,
          supplierName: invoiceData.supplierName,
          supplierTaxId: invoiceData.supplierTaxId,
          clientName: invoiceData.clientName,
          clientTaxId: invoiceData.clientTaxId,
          invoiceDate: invoiceData.invoiceDate,
          subtotal: invoiceData.subtotal,
          taxAmount: invoiceData.taxAmount,
          discount: invoiceData.discount,
          totalAmount: invoiceData.totalAmount,
          currency: invoiceData.currency || 'USD',
          status: 'PROCESSED',
          rawText: invoiceData.rawText,
          expenseId: expense.id,
          items: {
            create: itemsData.map((item) => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
            }))
          }
        },
        include: {
          items: true,
          expense: {
            include: { supplier: true, category: true }
          }
        }
      });

      return updatedInvoice;
    });
  }

  async updateStatus(id, status) {
    return prisma.invoice.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id) {
    return prisma.invoice.delete({
      where: { id }
    });
  }
}

module.exports = new InvoiceRepository();

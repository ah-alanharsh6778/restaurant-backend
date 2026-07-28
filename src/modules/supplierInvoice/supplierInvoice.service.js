const supplierInvoiceRepository = require('./supplierInvoice.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createSupplierInvoice = async (data) => {
  const { invoiceNumber, supplierId, purchaseOrderId, invoiceDate, subtotal, taxAmount, totalAmount, status, filePath } = data;

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) throw new NotFoundError('Supplier not found');

  const existingInvoice = await supplierInvoiceRepository.findByInvoiceNumber(invoiceNumber);
  if (existingInvoice) throw new BadRequestError(`Invoice number '${invoiceNumber}' already exists`);

  const parsedSubtotal = parseFloat(subtotal);
  const parsedTax = taxAmount !== undefined ? parseFloat(taxAmount) : 0;
  const parsedTotal = totalAmount !== undefined ? parseFloat(totalAmount) : (parsedSubtotal + parsedTax);

  return supplierInvoiceRepository.create({
    invoiceNumber,
    supplierId,
    purchaseOrderId: purchaseOrderId || null,
    invoiceDate: new Date(invoiceDate),
    subtotal: parsedSubtotal,
    taxAmount: parsedTax,
    totalAmount: parsedTotal,
    status: status || 'RECEIVED',
    filePath: filePath || null
  });
};

const getAllSupplierInvoices = async (query = {}) => {
  const { page = 1, limit = 50, supplierId, status } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await supplierInvoiceRepository.findAll({ skip, take, supplierId, status });

  return {
    invoices: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getSupplierInvoiceById = async (id) => {
  const invoice = await supplierInvoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Supplier invoice not found');
  return invoice;
};

module.exports = {
  createSupplierInvoice,
  getAllSupplierInvoices,
  getSupplierInvoiceById
};

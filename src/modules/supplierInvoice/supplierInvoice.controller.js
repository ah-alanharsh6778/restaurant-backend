const asyncHandler = require('../../utils/asyncHandler');
const supplierInvoiceService = require('./supplierInvoice.service');

const createSupplierInvoice = asyncHandler(async (req, res) => {
  const invoice = await supplierInvoiceService.createSupplierInvoice(req.body);
  return res.status(201).json({
    success: true,
    message: 'Supplier invoice created successfully',
    data: invoice
  });
});

const getAllSupplierInvoices = asyncHandler(async (req, res) => {
  const result = await supplierInvoiceService.getAllSupplierInvoices(req.query);
  return res.status(200).json({
    success: true,
    data: result.invoices,
    pagination: result.pagination
  });
});

const getSupplierInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await supplierInvoiceService.getSupplierInvoiceById(id);
  return res.status(200).json({
    success: true,
    data: invoice
  });
});

module.exports = {
  createSupplierInvoice,
  getAllSupplierInvoices,
  getSupplierInvoiceById
};

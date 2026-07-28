const asyncHandler = require('../../utils/asyncHandler');
const invoiceService = require('./invoice.service');

const uploadInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.uploadInvoiceFile(req.file);
  return res.status(201).json({
    success: true,
    message: 'Invoice file uploaded successfully',
    data: invoice
  });
});

const processInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const processed = await invoiceService.processInvoice(id);
  return res.status(200).json({
    success: true,
    message: 'Invoice processed with OCR & AI parsing. Expense created successfully.',
    data: processed
  });
});

const getAllInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.getAllInvoices(req.query);
  return res.status(200).json({
    success: true,
    data: result
  });
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await invoiceService.getInvoiceById(id);
  return res.status(200).json({
    success: true,
    data: invoice
  });
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await invoiceService.deleteInvoice(id);
  return res.status(200).json({
    success: true,
    message: 'Invoice deleted successfully',
    data: result
  });
});

const reprocessInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reprocessed = await invoiceService.reprocessInvoice(id);
  return res.status(200).json({
    success: true,
    message: 'Invoice reprocessed successfully',
    data: reprocessed
  });
});

module.exports = {
  uploadInvoice,
  processInvoice,
  getAllInvoices,
  getInvoiceById,
  deleteInvoice,
  reprocessInvoice
};

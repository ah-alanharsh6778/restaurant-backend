const fs = require('fs');
const invoiceRepository = require('./invoice.repository');
const ocrService = require('./ocr.service');
const invoiceParser = require('./invoice.parser');
const { BadRequestError, NotFoundError, ConflictError } = require('../../utils/errors');
const { InvoiceDTO } = require('../../dtos');
const logger = require('../../utils/logger');

const uploadInvoiceFile = async (file) => {
  if (!file) throw new BadRequestError('No file uploaded');

  const normalizedPath = file.path.replace(/\\/g, '/');
  if (logger && logger.info) logger.info(`[InvoiceService] Uploading & auto-processing invoice file: ${file.originalname}`);

  let rawText = '';
  let extractedData = null;

  try {
    // 1. Run OCR Layer immediately upon upload
    rawText = await ocrService.processImageOrPdf(normalizedPath, file.mimetype);

    // 2. Run AI Parsing Layer
    extractedData = await invoiceParser.parseOCRTextToJSON(rawText);
  } catch (err) {
    if (logger && logger.error) logger.error(`[InvoiceService] OCR/AI Extraction failed for ${file.originalname}: ${err.message}`);
    await invoiceRepository.createFailedInvoice(normalizedPath, err.message);
    throw err;
  }

  // 3. Duplicate Detection Check (Issue #1: Return HTTP 409 Conflict if duplicate exists)
  const duplicate = await invoiceRepository.findDuplicate(extractedData.invoiceNumber, extractedData.supplierName);
  if (duplicate) {
    if (logger && logger.warn) logger.warn(`[InvoiceService] Duplicate invoice upload blocked! Invoice #${extractedData.invoiceNumber} from '${extractedData.supplierName}' already exists.`);
    
    // Delete temp file from disk
    try {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (e) {
      // Ignore unlink error
    }

    throw new ConflictError(`Duplicate Invoice: Invoice #${extractedData.invoiceNumber} from supplier '${extractedData.supplierName}' already exists.`);
  }

  // 4. Save Invoice, Line Items, and Auto-Create Expense in Single Atomic Prisma Transaction
  const invoiceUpdateData = {
    invoiceNumber: extractedData.invoiceNumber,
    supplierName: extractedData.supplierName,
    supplierTaxId: extractedData.supplierTaxId,
    clientName: extractedData.clientName,
    clientTaxId: extractedData.clientTaxId,
    invoiceDate: extractedData.invoiceDate,
    subtotal: extractedData.subtotal,
    taxAmount: extractedData.taxAmount,
    discount: extractedData.discount,
    totalAmount: extractedData.totalAmount,
    currency: extractedData.currency,
    rawText,
    filePath: normalizedPath
  };

  const processedInvoice = await invoiceRepository.createProcessedInvoice(invoiceUpdateData, extractedData.items);

  if (logger && logger.info) logger.info(`[InvoiceService] Auto-processed invoice ID: ${processedInvoice.id}. Created Expense ID: ${processedInvoice.expenseId}`);

  return new InvoiceDTO(processedInvoice);
};

const processInvoice = async (id) => {
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Invoice not found');

  if (logger && logger.info) logger.info(`[InvoiceService] Processing invoice ID: ${id}`);

  try {
    await invoiceRepository.updateStatus(id, 'PROCESSING');

    // 1. Run OCR Layer
    const rawText = await ocrService.processImageOrPdf(invoice.filePath, 'application/octet-stream');

    // 2. Run AI Parsing Layer
    const extractedData = await invoiceParser.parseOCRTextToJSON(rawText);

    // 3. Check for Duplicate Invoice
    const duplicate = await invoiceRepository.findDuplicate(extractedData.invoiceNumber, extractedData.supplierName, id);
    if (duplicate) {
      throw new ConflictError(`Duplicate Invoice: Invoice #${extractedData.invoiceNumber} from supplier '${extractedData.supplierName}' already exists.`);
    }

    const invoiceUpdateData = {
      invoiceNumber: extractedData.invoiceNumber,
      supplierName: extractedData.supplierName,
      supplierTaxId: extractedData.supplierTaxId,
      clientName: extractedData.clientName,
      clientTaxId: extractedData.clientTaxId,
      invoiceDate: extractedData.invoiceDate,
      subtotal: extractedData.subtotal,
      taxAmount: extractedData.taxAmount,
      discount: extractedData.discount,
      totalAmount: extractedData.totalAmount,
      currency: extractedData.currency,
      rawText,
      filePath: invoice.filePath
    };

    const processedInvoice = await invoiceRepository.updateProcessResult(
      id,
      invoiceUpdateData,
      extractedData.items,
      { total: extractedData.totalAmount }
    );

    return new InvoiceDTO(processedInvoice);
  } catch (err) {
    if (logger && logger.error) logger.error(`[InvoiceService] Processing failed for invoice ID: ${id} - ${err.message}`);
    await invoiceRepository.updateStatus(id, 'FAILED');
    throw err;
  }
};

const getAllInvoices = async (query = {}) => {
  const { page = 1, limit = 50, status, search } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await invoiceRepository.findAll({ skip, take, status, search });

  return {
    invoices: items.map((inv) => new InvoiceDTO(inv)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getInvoiceById = async (id) => {
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Invoice not found');
  return new InvoiceDTO(invoice);
};

const deleteInvoice = async (id) => {
  const invoice = await invoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Invoice not found');

  await invoiceRepository.delete(id);
  return { id };
};

const reprocessInvoice = async (id) => {
  return processInvoice(id);
};

module.exports = {
  uploadInvoiceFile,
  processInvoice,
  getAllInvoices,
  getInvoiceById,
  deleteInvoice,
  reprocessInvoice
};

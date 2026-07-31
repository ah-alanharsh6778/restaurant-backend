const expenseRepository = require('./expense.repository');
const prisma = require('../../config/prisma');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const ExcelJS = require('exceljs');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { ExpenseDTO } = require('../../dtos');

// Category Services
const createExpenseCategory = async (data) => {
  const { name, description } = data;
  const existingCategory = await expenseRepository.findCategoryByName(name);
  if (existingCategory) throw new BadRequestError('Expense category name already exists');

  return expenseRepository.createCategory({
    name,
    description: description || null
  });
};

const getAllExpenseCategories = async () => {
  return expenseRepository.findAllCategories();
};

const updateExpenseCategory = async (id, data) => {
  const existingCategory = await expenseRepository.findCategoryById(id);
  if (!existingCategory) throw new NotFoundError('Expense category not found');

  if (data.name && data.name !== existingCategory.name) {
    const duplicateName = await expenseRepository.findCategoryByName(data.name);
    if (duplicateName) throw new BadRequestError('Expense category name already exists');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  return expenseRepository.updateCategory(id, updateData);
};

const deleteExpenseCategory = async (id) => {
  const existingCategory = await expenseRepository.findCategoryById(id);
  if (!existingCategory) throw new NotFoundError('Expense category not found');

  await expenseRepository.deleteCategory(id);
  return { id };
};

// Expense CRUD Services
const createExpense = async (data) => {
  const { supplierId, categoryId, invoiceNumber, invoiceDate, amount, tax, total, status, filePath, remarks } = data;

  if (amount === undefined || amount === null || parseFloat(amount) < 0) {
    throw new BadRequestError('Amount must be a valid non-negative number');
  }

  const parsedAmount = parseFloat(amount);
  const parsedTax = tax !== undefined ? parseFloat(tax) : 0;
  const parsedTotal = total !== undefined ? parseFloat(total) : (parsedAmount + parsedTax);

  if (supplierId) {
    const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) throw new NotFoundError('Supplier not found');
  }

  if (categoryId) {
    const category = await expenseRepository.findCategoryById(categoryId);
    if (!category) throw new NotFoundError('Expense category not found');
  }

  const expense = await expenseRepository.createExpense({
    supplierId: supplierId || null,
    categoryId: categoryId || null,
    invoiceNumber: invoiceNumber || null,
    invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
    amount: parsedAmount,
    tax: parsedTax,
    total: parsedTotal,
    status: status || 'PROCESSED',
    filePath: filePath || null,
    remarks: remarks || null
  });

  return new ExpenseDTO(expense);
};

const getAllExpenses = async (query = {}) => {
  const { page = 1, limit = 50, supplierId, categoryId, status } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await expenseRepository.findAllExpenses({ skip, take, supplierId, categoryId, status });

  return {
    expenses: items.map((exp) => new ExpenseDTO(exp)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getExpenseById = async (id) => {
  const expense = await expenseRepository.findExpenseById(id);
  if (!expense) throw new NotFoundError('Expense not found');

  return new ExpenseDTO(expense);
};

const updateExpense = async (id, data) => {
  const existingExpense = await expenseRepository.findExpenseById(id);
  if (!existingExpense) throw new NotFoundError('Expense not found');

  const updateData = {};
  if (data.supplierId !== undefined) updateData.supplierId = data.supplierId || null;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.invoiceNumber !== undefined) updateData.invoiceNumber = data.invoiceNumber || null;
  if (data.invoiceDate !== undefined) updateData.invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : null;
  if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
  if (data.tax !== undefined) updateData.tax = parseFloat(data.tax);
  if (data.total !== undefined) updateData.total = parseFloat(data.total);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.filePath !== undefined) updateData.filePath = data.filePath;
  if (data.remarks !== undefined) updateData.remarks = data.remarks;

  const updatedExpense = await expenseRepository.updateExpense(id, updateData);
  return new ExpenseDTO(updatedExpense);
};

const deleteExpense = async (id) => {
  const existingExpense = await expenseRepository.findExpenseById(id);
  if (!existingExpense) throw new NotFoundError('Expense not found');

  await expenseRepository.deleteExpense(id);
  return { id };
};

const invoiceService = require('../invoice/invoice.service');

// Invoice Upload & AI OCR Integration Service
const processUploadedInvoices = async (files) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new BadRequestError('No invoice files uploaded');
  }

  const createdInvoices = [];
  for (const file of files) {
    const invoice = await invoiceService.uploadInvoiceFile(file);
    createdInvoices.push(invoice);
  }

  return createdInvoices;
};

// Excel Export Service
const generateExpenseRegisterExcel = async (res) => {
  const { items: expenses } = await expenseRepository.findAllExpenses();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expense Register');

  worksheet.columns = [
    { header: 'Invoice Number', key: 'invoiceNumber', width: 20 },
    { header: 'Supplier', key: 'supplier', width: 25 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Invoice Date', key: 'invoiceDate', width: 15 },
    { header: 'Subtotal', key: 'subtotal', width: 15 },
    { header: 'Tax', key: 'tax', width: 12 },
    { header: 'Total', key: 'total', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created Date', key: 'createdDate', width: 20 }
  ];

  expenses.forEach((exp) => {
    worksheet.addRow({
      invoiceNumber: exp.invoiceNumber || 'N/A',
      supplier: exp.supplier ? exp.supplier.name : 'N/A',
      category: exp.category ? exp.category.name : 'Uncategorized',
      invoiceDate: exp.invoiceDate ? new Date(exp.invoiceDate).toISOString().split('T')[0] : 'N/A',
      subtotal: exp.amount,
      tax: exp.tax,
      total: exp.total,
      status: exp.status,
      createdDate: new Date(exp.createdAt).toISOString().split('T')[0]
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="ExpenseRegister.xlsx"');

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = {
  createExpenseCategory,
  getAllExpenseCategories,
  updateExpenseCategory,
  deleteExpenseCategory,
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  processUploadedInvoices,
  generateExpenseRegisterExcel
};

const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expense.service');

// Category Controllers
const createExpenseCategory = asyncHandler(async (req, res) => {
  const category = await expenseService.createExpenseCategory(req.body);
  return res.status(201).json({
    success: true,
    message: 'Expense category created successfully',
    data: category
  });
});

const getAllExpenseCategories = asyncHandler(async (req, res) => {
  const categories = await expenseService.getAllExpenseCategories();
  return res.status(200).json({
    success: true,
    data: categories
  });
});

const updateExpenseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const category = await expenseService.updateExpenseCategory(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Expense category updated successfully',
    data: category
  });
});

const deleteExpenseCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await expenseService.deleteExpenseCategory(id);
  return res.status(200).json({
    success: true,
    message: 'Expense category deleted successfully'
  });
});

// Expense Controllers
const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);
  return res.status(201).json({
    success: true,
    message: 'Expense created successfully',
    data: expense
  });
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.getAllExpenses(req.query);
  return res.status(200).json({
    success: true,
    data: result.expenses,
    pagination: result.pagination
  });
});

const getExpenseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await expenseService.getExpenseById(id);
  return res.status(200).json({
    success: true,
    data: expense
  });
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await expenseService.updateExpense(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: expense
  });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await expenseService.deleteExpense(id);
  return res.status(200).json({
    success: true,
    message: 'Expense deleted successfully'
  });
});

// Upload & Export Controllers
const uploadInvoices = asyncHandler(async (req, res) => {
  const expenses = await expenseService.processUploadedInvoices(req.files);
  return res.status(201).json({
    success: true,
    message: 'Invoices uploaded and processed successfully',
    data: expenses
  });
});

const exportExpenseRegister = asyncHandler(async (req, res) => {
  await expenseService.generateExpenseRegisterExcel(res);
});

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
  uploadInvoices,
  exportExpenseRegister
};

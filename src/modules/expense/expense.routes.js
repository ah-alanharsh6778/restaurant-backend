const express = require('express');
const expenseController = require('./expense.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const authorizeRoles = require('../../middleware/role.middleware');
const {
  upload,
  createCategoryValidation,
  createExpenseValidation,
  validate
} = require('./expense.validation');

const router = express.Router();

router.use(authenticateToken);

// Expense Category Routes
router.post('/categories', authorizeRoles('ADMIN', 'MANAGER'), createCategoryValidation, validate, expenseController.createExpenseCategory);
router.get('/categories', expenseController.getAllExpenseCategories);
router.put('/categories/:id', authorizeRoles('ADMIN', 'MANAGER'), expenseController.updateExpenseCategory);
router.delete('/categories/:id', authorizeRoles('ADMIN', 'MANAGER'), expenseController.deleteExpenseCategory);

// Special Expense Routes (Upload & Export)
router.post('/upload', authorizeRoles('ADMIN', 'MANAGER'), upload.array('invoices', 20), expenseController.uploadInvoices);
router.get('/export', authorizeRoles('ADMIN', 'MANAGER'), expenseController.exportExpenseRegister);

// Expense CRUD Routes
router.post('/', authorizeRoles('ADMIN', 'MANAGER'), createExpenseValidation, validate, expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER'), expenseController.updateExpense);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), expenseController.deleteExpense);

module.exports = router;

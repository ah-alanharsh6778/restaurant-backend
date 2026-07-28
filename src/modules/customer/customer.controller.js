const asyncHandler = require('../../utils/asyncHandler');
const customerService = require('./customer.service');

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.body);
  return res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: customer
  });
});

const getAllCustomers = asyncHandler(async (req, res) => {
  const result = await customerService.getAllCustomers(req.query);
  return res.status(200).json({
    success: true,
    data: result.customers,
    pagination: result.pagination
  });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await customerService.getCustomerById(id);
  return res.status(200).json({
    success: true,
    data: customer
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await customerService.updateCustomer(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: customer
  });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await customerService.deleteCustomer(id);
  return res.status(200).json({
    success: true,
    message: 'Customer deleted successfully'
  });
});

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

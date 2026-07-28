const asyncHandler = require('../../utils/asyncHandler');
const supplierService = require('./supplier.service');

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await supplierService.createSupplier(req.body);
  return res.status(201).json({
    success: true,
    message: 'Supplier created successfully',
    data: supplier
  });
});

const getAllSuppliers = asyncHandler(async (req, res) => {
  const result = await supplierService.getAllSuppliers(req.query);
  return res.status(200).json({
    success: true,
    data: result.suppliers,
    pagination: result.pagination
  });
});

const getSupplierById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const supplier = await supplierService.getSupplierById(id);
  return res.status(200).json({
    success: true,
    data: supplier
  });
});

const updateSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const supplier = await supplierService.updateSupplier(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Supplier updated successfully',
    data: supplier
  });
});

const deleteSupplier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await supplierService.deleteSupplier(id);
  return res.status(200).json({
    success: true,
    message: 'Supplier deleted successfully'
  });
});

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};

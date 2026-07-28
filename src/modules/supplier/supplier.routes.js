const express = require('express');
const supplierController = require('./supplier.controller');
const {
  createSupplierValidation,
  updateSupplierValidation,
  validate
} = require('./supplier.validation');

const router = express.Router();

router.post('/', createSupplierValidation, validate, supplierController.createSupplier);

router.get('/', supplierController.getAllSuppliers);

router.get('/:id', supplierController.getSupplierById);

router.put('/:id', updateSupplierValidation, validate, supplierController.updateSupplier);

router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;

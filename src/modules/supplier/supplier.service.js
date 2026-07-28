const supplierRepository = require('./supplier.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { SupplierDTO } = require('../../dtos');

const createSupplier = async (data) => {
  const { name, contactPerson, phone, email, address, gstNumber, isActive } = data;

  const existingName = await supplierRepository.findByName(name);
  if (existingName) throw new BadRequestError('Supplier name already exists');

  const existingEmail = await supplierRepository.findByEmail(email);
  if (existingEmail) throw new BadRequestError('Supplier email already exists');

  if (gstNumber) {
    const existingGst = await supplierRepository.findByGstNumber(gstNumber);
    if (existingGst) throw new BadRequestError('Supplier GST number already exists');
  }

  const supplier = await supplierRepository.create({
    name,
    contactPerson,
    phone,
    email,
    address,
    gstNumber: gstNumber || null,
    isActive: isActive !== undefined ? Boolean(isActive) : true
  });

  return new SupplierDTO(supplier);
};

const getAllSuppliers = async (query = {}) => {
  const { page = 1, limit = 50, isActive } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await supplierRepository.findAll({ skip, take, isActive });

  return {
    suppliers: items.map((s) => new SupplierDTO(s)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getSupplierById = async (id) => {
  const supplier = await supplierRepository.findById(id);
  if (!supplier) throw new NotFoundError('Supplier not found');
  return new SupplierDTO(supplier);
};

const updateSupplier = async (id, data) => {
  const existingSupplier = await supplierRepository.findById(id);
  if (!existingSupplier) throw new NotFoundError('Supplier not found');

  if (data.name && data.name !== existingSupplier.name) {
    const duplicate = await supplierRepository.findByName(data.name);
    if (duplicate) throw new BadRequestError('Supplier name already exists');
  }

  if (data.email && data.email !== existingSupplier.email) {
    const duplicate = await supplierRepository.findByEmail(data.email);
    if (duplicate) throw new BadRequestError('Supplier email already exists');
  }

  if (data.gstNumber && data.gstNumber !== existingSupplier.gstNumber) {
    const duplicate = await supplierRepository.findByGstNumber(data.gstNumber);
    if (duplicate) throw new BadRequestError('Supplier GST number already exists');
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.contactPerson !== undefined) updateData.contactPerson = data.contactPerson;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.gstNumber !== undefined) updateData.gstNumber = data.gstNumber || null;
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

  const updated = await supplierRepository.update(id, updateData);
  return new SupplierDTO(updated);
};

const deleteSupplier = async (id) => {
  const existingSupplier = await supplierRepository.findById(id);
  if (!existingSupplier) throw new NotFoundError('Supplier not found');
  await supplierRepository.delete(id);
  return { id };
};

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};

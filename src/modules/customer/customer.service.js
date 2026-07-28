const customerRepository = require('./customer.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createCustomer = async (data) => {
  const { fullName, email, phone, loyaltyPoints } = data;

  if (phone) {
    const existingPhone = await customerRepository.findByPhone(phone);
    if (existingPhone) throw new BadRequestError('Customer phone number already registered');
  }

  if (email) {
    const existingEmail = await customerRepository.findByEmail(email);
    if (existingEmail) throw new BadRequestError('Customer email already registered');
  }

  return customerRepository.create({
    fullName,
    email: email || null,
    phone: phone || null,
    loyaltyPoints: loyaltyPoints !== undefined ? parseInt(loyaltyPoints, 10) : 0
  });
};

const getAllCustomers = async (query = {}) => {
  const { page = 1, limit = 50, search } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await customerRepository.findAll({ skip, take, search });

  return {
    customers: items,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getCustomerById = async (id) => {
  const customer = await customerRepository.findById(id);
  if (!customer) throw new NotFoundError('Customer not found');
  return customer;
};

const updateCustomer = async (id, data) => {
  const existing = await customerRepository.findById(id);
  if (!existing) throw new NotFoundError('Customer not found');

  if (data.phone && data.phone !== existing.phone) {
    const duplicate = await customerRepository.findByPhone(data.phone);
    if (duplicate) throw new BadRequestError('Customer phone number already registered');
  }

  const updateData = {};
  if (data.fullName !== undefined) updateData.fullName = data.fullName;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.loyaltyPoints !== undefined) updateData.loyaltyPoints = parseInt(data.loyaltyPoints, 10);

  return customerRepository.update(id, updateData);
};

const deleteCustomer = async (id) => {
  const existing = await customerRepository.findById(id);
  if (!existing) throw new NotFoundError('Customer not found');
  await customerRepository.delete(id);
  return { id };
};

module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

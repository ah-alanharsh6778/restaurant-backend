const tableRepository = require('./table.repository');
const customerRepository = require('../customer/customer.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { TableDTO } = require('../../dtos');

const createTable = async (data) => {
  const { tableNumber, capacity, status } = data;

  const existingTable = await tableRepository.findByTableNumber(tableNumber);

  if (existingTable) {
    throw new BadRequestError('Table number already exists');
  }

  const table = await tableRepository.create({
    tableNumber,
    capacity: parseInt(capacity, 10),
    status: status || 'AVAILABLE',
  });

  return new TableDTO(table);
};

const getAllTables = async (query = {}) => {
  const { page = 1, limit = 50, status } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await tableRepository.findAll({ skip, take, status });

  return {
    tables: items.map((t) => new TableDTO(t)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take),
    },
  };
};

const getTableById = async (id) => {
  const table = await tableRepository.findById(id);

  if (!table) {
    throw new NotFoundError('Table not found');
  }

  return new TableDTO(table);
};

const bookTable = async (tableId, bookingData) => {
  const { customerName, phone, email, guests, bookingDate, bookingTime, specialNotes } = bookingData;

  const nameStr = customerName || bookingData.name || bookingData.customer?.fullName;
  const phoneStr = phone || bookingData.customer?.phone;

  if (!nameStr || !String(nameStr).trim()) {
    throw new BadRequestError('Customer Name is required');
  }
  if (!phoneStr || !String(phoneStr).trim()) {
    throw new BadRequestError('Phone Number is required');
  }

  const table = await tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table not found');
  }

  const currentStatus = String(table.status).toUpperCase();
  if (currentStatus === 'MAINTENANCE') {
    throw new BadRequestError('Cannot book a table that is under maintenance');
  }
  if (currentStatus === 'OCCUPIED') {
    throw new BadRequestError('Cannot book an occupied table');
  }

  const guestCount = guests ? parseInt(guests, 10) : (table.capacity || 2);

  // Search existing customer by Phone Number
  const cleanPhone = String(phoneStr).trim();
  let customer = await customerRepository.findByPhone(cleanPhone);

  if (customer) {
    if (email && !customer.email) {
      customer = await customerRepository.update(customer.id, { email: String(email).trim() });
    }
  } else {
    customer = await customerRepository.create({
      fullName: String(nameStr).trim(),
      phone: cleanPhone,
      email: email ? String(email).trim() : null,
    });
  }

  // Create Reservation
  const dateObj = bookingDate ? new Date(bookingDate) : new Date();
  await tableRepository.createReservation({
    customerId: customer.id,
    tableId,
    guestCount,
    bookingDate: dateObj,
    bookingTime: bookingTime ? String(bookingTime).trim() : '19:30',
    specialNotes: specialNotes ? String(specialNotes).trim() : null,
    status: 'CONFIRMED',
  });

  // Update Table Status = RESERVED and attach customerId
  await tableRepository.update(tableId, {
    status: 'RESERVED',
    customerId: customer.id,
  });

  const updatedTable = await tableRepository.findById(tableId);
  return new TableDTO(updatedTable);
};

const checkInTable = async (tableId) => {
  const table = await tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table not found');
  }

  const activeReservation = await tableRepository.findActiveReservation(tableId);
  if (activeReservation) {
    await tableRepository.updateReservationStatus(activeReservation.id, 'CHECKED_IN');
  }

  await tableRepository.updateStatus(tableId, 'OCCUPIED');

  const updatedTable = await tableRepository.findById(tableId);
  return new TableDTO(updatedTable);
};

const cancelTableBooking = async (tableId) => {
  const table = await tableRepository.findById(tableId);
  if (!table) {
    throw new NotFoundError('Table not found');
  }

  const activeReservation = await tableRepository.findActiveReservation(tableId);
  if (activeReservation) {
    await tableRepository.updateReservationStatus(activeReservation.id, 'CANCELLED');
  }

  await tableRepository.update(tableId, {
    status: 'AVAILABLE',
    customerId: null,
  });

  const updatedTable = await tableRepository.findById(tableId);
  return new TableDTO(updatedTable);
};

const updateTable = async (id, data) => {
  const existingTable = await tableRepository.findById(id);

  if (!existingTable) {
    throw new NotFoundError('Table not found');
  }

  // If booking fields are passed to updateTable, handle via bookTable
  if (data.customerName || data.phone || data.customerName !== undefined) {
    return bookTable(id, data);
  }

  if (data.status === 'OCCUPIED' && existingTable.status === 'RESERVED') {
    return checkInTable(id);
  }

  if (data.status === 'AVAILABLE' && existingTable.status === 'RESERVED') {
    return cancelTableBooking(id);
  }

  if (data.tableNumber && data.tableNumber !== existingTable.tableNumber) {
    const duplicateTable = await tableRepository.findByTableNumber(data.tableNumber);
    if (duplicateTable) {
      throw new BadRequestError('Table number already exists');
    }
  }

  const updateData = {};
  if (data.tableNumber !== undefined) updateData.tableNumber = data.tableNumber;
  if (data.capacity !== undefined) updateData.capacity = parseInt(data.capacity, 10);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.customerId !== undefined) updateData.customerId = data.customerId;

  const updatedTable = await tableRepository.update(id, updateData);

  return new TableDTO(updatedTable);
};

const deleteTable = async (id) => {
  const existingTable = await tableRepository.findById(id);

  if (!existingTable) {
    throw new NotFoundError('Table not found');
  }

  await tableRepository.delete(id);
  return { id };
};

const getTableAvailability = async () => {
  return tableRepository.getAvailabilityStats();
};

const updateTableStatus = async (id, status) => {
  const existingTable = await tableRepository.findById(id);
  if (!existingTable) {
    throw new NotFoundError('Table not found');
  }

  const statusUpper = String(status).toUpperCase();
  if (statusUpper === 'OCCUPIED' && existingTable.status === 'RESERVED') {
    return checkInTable(id);
  }
  if (statusUpper === 'AVAILABLE' && existingTable.status === 'RESERVED') {
    return cancelTableBooking(id);
  }

  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
  if (!status || !validStatuses.includes(statusUpper)) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updatedTable = await tableRepository.updateStatus(id, statusUpper);
  return new TableDTO(updatedTable);
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  getTableAvailability,
  updateTableStatus,
  bookTable,
  checkInTable,
  cancelTableBooking,
};

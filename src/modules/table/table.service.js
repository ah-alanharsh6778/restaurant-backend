const tableRepository = require('./table.repository');
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
    status: status || 'AVAILABLE'
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
      totalPages: Math.ceil(total / take)
    }
  };
};

const getTableById = async (id) => {
  const table = await tableRepository.findById(id);

  if (!table) {
    throw new NotFoundError('Table not found');
  }

  return new TableDTO(table);
};

const updateTable = async (id, data) => {
  const existingTable = await tableRepository.findById(id);

  if (!existingTable) {
    throw new NotFoundError('Table not found');
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

  const validStatuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
  if (!status || !validStatuses.includes(String(status).toUpperCase())) {
    throw new BadRequestError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updatedTable = await tableRepository.updateStatus(id, String(status).toUpperCase());
  return new TableDTO(updatedTable);
};

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
  getTableAvailability,
  updateTableStatus
};

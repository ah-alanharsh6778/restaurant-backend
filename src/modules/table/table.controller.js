const asyncHandler = require('../../utils/asyncHandler');
const tableService = require('./table.service');

const createTable = asyncHandler(async (req, res) => {
  const table = await tableService.createTable(req.body);
  return res.status(201).json({
    success: true,
    message: 'Table created successfully',
    data: table,
  });
});

const getAllTables = asyncHandler(async (req, res) => {
  const result = await tableService.getAllTables(req.query);
  return res.status(200).json({
    success: true,
    data: result.tables,
    pagination: result.pagination,
  });
});

const getTableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await tableService.getTableById(id);
  return res.status(200).json({
    success: true,
    data: table,
  });
});

const updateTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await tableService.updateTable(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Table updated successfully',
    data: table,
  });
});

const deleteTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await tableService.deleteTable(id);
  return res.status(200).json({
    success: true,
    message: 'Table deleted successfully',
  });
});

const getTableAvailability = asyncHandler(async (req, res) => {
  const stats = await tableService.getTableAvailability();
  return res.status(200).json({
    success: true,
    data: stats,
  });
});

const updateTableStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const table = await tableService.updateTableStatus(id, status);
  return res.status(200).json({
    success: true,
    message: `Table status updated to ${table.status}`,
    data: table,
  });
});

const bookTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await tableService.bookTable(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Table booked successfully and customer attached',
    data: table,
  });
});

const checkInTable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await tableService.checkInTable(id);
  return res.status(200).json({
    success: true,
    message: 'Guest checked in successfully. Table is now occupied.',
    data: table,
  });
});

const cancelTableBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const table = await tableService.cancelTableBooking(id);
  return res.status(200).json({
    success: true,
    message: 'Table booking cancelled and table freed to available.',
    data: table,
  });
});

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

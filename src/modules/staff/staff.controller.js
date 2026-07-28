const asyncHandler = require('../../utils/asyncHandler');
const staffService = require('./staff.service');

const createStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.createStaff(req.body);
  return res.status(201).json({
    success: true,
    message: 'Staff profile created successfully',
    data: staff
  });
});

const getAllStaff = asyncHandler(async (req, res) => {
  const result = await staffService.getAllStaff(req.query);
  return res.status(200).json({
    success: true,
    data: result.staff,
    pagination: result.pagination
  });
});

const getStaffById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await staffService.getStaffById(id);
  return res.status(200).json({
    success: true,
    data: staff
  });
});

const updateStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const staff = await staffService.updateStaff(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Staff profile updated successfully',
    data: staff
  });
});

const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await staffService.deleteStaff(id);
  return res.status(200).json({
    success: true,
    message: 'Staff profile deleted successfully'
  });
});

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
};

const asyncHandler = require('../../utils/asyncHandler');
const menuService = require('./menu.service');

const createCategory = asyncHandler(async (req, res) => {
  const category = await menuService.createCategory(req.body);
  return res.status(201).json({
    success: true,
    message: 'Menu category created successfully',
    data: category
  });
});

const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await menuService.getAllCategories();
  return res.status(200).json({
    success: true,
    data: categories
  });
});

const createMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await menuService.createMenuItem(req.body);
  return res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem
  });
});

const getAllMenuItems = asyncHandler(async (req, res) => {
  const result = await menuService.getAllMenuItems(req.query);
  return res.status(200).json({
    success: true,
    data: result.menuItems,
    pagination: result.pagination
  });
});

const getMenuItemById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await menuService.getMenuItemById(id);
  return res.status(200).json({
    success: true,
    data: menuItem
  });
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const menuItem = await menuService.updateMenuItem(id, req.body);
  return res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem
  });
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await menuService.deleteMenuItem(id);
  return res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully'
  });
});

module.exports = {
  createCategory,
  getAllCategories,
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
};

const menuRepository = require('./menu.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const { MenuItemDTO } = require('../../dtos');

const createCategory = async (data) => {
  const { name, description } = data;

  const existing = await menuRepository.findCategoryByName(name);
  if (existing) {
    throw new BadRequestError('Menu category name already exists');
  }

  return menuRepository.createCategory({
    name,
    description: description || null
  });
};

const getAllCategories = async () => {
  return menuRepository.findAllCategories();
};

const createMenuItem = async (data) => {
  const { name, description, price, isAvailable, categoryId } = data;

  const category = await menuRepository.findCategoryById(categoryId);
  if (!category) {
    throw new NotFoundError('Menu category not found');
  }

  const item = await menuRepository.createMenuItem({
    name,
    description: description || null,
    price: parseFloat(price),
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    categoryId
  });

  return new MenuItemDTO(item);
};

const getAllMenuItems = async (query = {}) => {
  const { page = 1, limit = 50, categoryId, isAvailable } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await menuRepository.findAllMenuItems({ skip, take, categoryId, isAvailable });

  return {
    menuItems: items.map((item) => new MenuItemDTO(item)),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getMenuItemById = async (id) => {
  const item = await menuRepository.findMenuItemById(id);
  if (!item) {
    throw new NotFoundError('Menu item not found');
  }
  return new MenuItemDTO(item);
};

const updateMenuItem = async (id, data) => {
  const existing = await menuRepository.findMenuItemById(id);
  if (!existing) {
    throw new NotFoundError('Menu item not found');
  }

  if (data.categoryId && data.categoryId !== existing.categoryId) {
    const category = await menuRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Menu category not found');
    }
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = parseFloat(data.price);
  if (data.isAvailable !== undefined) updateData.isAvailable = Boolean(data.isAvailable);
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

  const updated = await menuRepository.updateMenuItem(id, updateData);
  return new MenuItemDTO(updated);
};

const deleteMenuItem = async (id) => {
  const existing = await menuRepository.findMenuItemById(id);
  if (!existing) {
    throw new NotFoundError('Menu item not found');
  }

  await menuRepository.deleteMenuItem(id);
  return { id };
};

module.exports = {
  createCategory,
  getAllCategories,
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
};

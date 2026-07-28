const roleRepository = require('./role.repository');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createRole = async (data) => {
  const { name, description } = data;

  const existing = await roleRepository.findByName(name);
  if (existing) throw new BadRequestError(`Role '${name}' already exists`);

  return roleRepository.create({
    name,
    description: description || null
  });
};

const getAllRoles = async (query = {}) => {
  const { page = 1, limit = 50, search, sortBy = 'name', sortOrder = 'asc' } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await roleRepository.findAll({
    skip,
    take,
    search,
    sortBy,
    sortOrder
  });

  return {
    roles: items.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count ? r._count.users : 0,
      createdAt: r.createdAt
    })),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);
  if (!role) throw new NotFoundError('Role not found');

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    users: role.users.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email })),
    createdAt: role.createdAt
  };
};

const updateRole = async (id, data) => {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Role not found');

  if (data.name && data.name !== existing.name) {
    const duplicate = await roleRepository.findByName(data.name);
    if (duplicate) throw new BadRequestError(`Role '${data.name}' already exists`);
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;

  return roleRepository.update(id, updateData);
};

const deleteRole = async (id) => {
  const existing = await roleRepository.findById(id);
  if (!existing) throw new NotFoundError('Role not found');

  if (existing.users && existing.users.length > 0) {
    throw new BadRequestError('Cannot delete role assigned to active users');
  }

  await roleRepository.delete(id);
  return { id };
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole
};

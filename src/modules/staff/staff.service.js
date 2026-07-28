const staffRepository = require('./staff.repository');
const prisma = require('../../config/prisma');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const createStaff = async (data) => {
  const { userId, employeeCode, department, designation, shift, hireDate, salary, emergencyContact } = data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('Associated user not found');

  const existingCode = await staffRepository.findByEmployeeCode(employeeCode);
  if (existingCode) throw new BadRequestError(`Employee code '${employeeCode}' already in use`);

  const existingStaff = await staffRepository.findByUserId(userId);
  if (existingStaff) throw new BadRequestError('User already has an associated staff profile');

  return staffRepository.create({
    userId,
    employeeCode,
    department,
    designation,
    shift: shift || null,
    hireDate: new Date(hireDate),
    salary: salary !== undefined ? parseFloat(salary) : null,
    emergencyContact: emergencyContact || null
  });
};

const getAllStaff = async (query = {}) => {
  const { page = 1, limit = 50, search, department, shift, sortBy, sortOrder } = query;
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const { items, total } = await staffRepository.findAll({
    skip,
    take,
    search,
    department,
    shift,
    sortBy,
    sortOrder
  });

  return {
    staff: items.map((s) => ({
      id: s.id,
      userId: s.userId,
      fullName: s.user ? s.user.fullName : null,
      email: s.user ? s.user.email : null,
      role: s.user && s.user.role ? s.user.role.name : null,
      employeeCode: s.employeeCode,
      department: s.department,
      designation: s.designation,
      shift: s.shift,
      hireDate: s.hireDate,
      salary: s.salary,
      emergencyContact: s.emergencyContact,
      createdAt: s.createdAt
    })),
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / take)
    }
  };
};

const getStaffById = async (id) => {
  const s = await staffRepository.findById(id);
  if (!s) throw new NotFoundError('Staff profile not found');

  return {
    id: s.id,
    userId: s.userId,
    fullName: s.user ? s.user.fullName : null,
    email: s.user ? s.user.email : null,
    role: s.user && s.user.role ? s.user.role.name : null,
    employeeCode: s.employeeCode,
    department: s.department,
    designation: s.designation,
    shift: s.shift,
    hireDate: s.hireDate,
    salary: s.salary,
    emergencyContact: s.emergencyContact,
    createdAt: s.createdAt
  };
};

const updateStaff = async (id, data) => {
  const existing = await staffRepository.findById(id);
  if (!existing) throw new NotFoundError('Staff profile not found');

  if (data.employeeCode && data.employeeCode !== existing.employeeCode) {
    const duplicate = await staffRepository.findByEmployeeCode(data.employeeCode);
    if (duplicate) throw new BadRequestError(`Employee code '${data.employeeCode}' already in use`);
  }

  const updateData = {};
  if (data.employeeCode !== undefined) updateData.employeeCode = data.employeeCode;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.designation !== undefined) updateData.designation = data.designation;
  if (data.shift !== undefined) updateData.shift = data.shift;
  if (data.hireDate !== undefined) updateData.hireDate = new Date(data.hireDate);
  if (data.salary !== undefined) updateData.salary = parseFloat(data.salary);
  if (data.emergencyContact !== undefined) updateData.emergencyContact = data.emergencyContact;

  return staffRepository.update(id, updateData);
};

const deleteStaff = async (id) => {
  const existing = await staffRepository.findById(id);
  if (!existing) throw new NotFoundError('Staff profile not found');

  await staffRepository.delete(id);
  return { id };
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
};
